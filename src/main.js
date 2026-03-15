import { createDatepicker } from "./datepicker.js";

// Redirect to login if no auth token is present.
// Replace with real JWT validation once the API is ready.
if (!localStorage.getItem("auth_token")) {
  window.location.replace("/login.html");
}

let accounts = { pay: [], receive: [] };
let nextID = 10; // starts at 10 to avoid falsy checks on id=0
let dpPay, dpReceive;
let initialized = false; // prevents pop animations from firing on first render

function formatValue(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Converts "YYYY-MM-DD" to "DD/MM". Returns "—" if empty. */
function formatDate(str) {
  if (!str) return "—";
  const [, m, d] = str.split("-");
  return `${d}/${m}`;
}

function addAccount(type) {
  const descriptionEl = document.getElementById(`desc-${type}`);
  const valueEl = document.getElementById(`value-${type}`);
  const dateEl = document.getElementById(`date-${type}`);

  const description = descriptionEl.value.trim();
  const value = parseFloat(valueEl.value);
  const dueDate = dateEl.value;

  if (!description || isNaN(value) || value <= 0) {
    descriptionEl.classList.add("error");
    setTimeout(() => descriptionEl.classList.remove("error"), 1000);
    return;
  }

  accounts[type].push({
    id: nextID++,
    description,
    value,
    expiry_date: dueDate,
    paid: false,
  });

  descriptionEl.value = "";
  valueEl.value = "";
  if (type === "pay") dpPay.reset();
  else dpReceive.reset();
  descriptionEl.focus();

  render();
}

function togglePaid(type, id) {
  const account = accounts[type].find((a) => a.id === id);
  if (account) account.paid = !account.paid;
  render();
}

function deleteAccount(type, id) {
  accounts[type] = accounts[type].filter((a) => a.id !== id);
  render();
}

function renderList(type) {
  const listId = type === "pay" ? "payment-list" : "receive-list";
  const list = document.getElementById(listId);
  const items = accounts[type];

  if (items.length === 0) {
    list.innerHTML = `
      <div class="py-8 text-center text-sm" style="color: var(--muted);">
        Nenhuma conta registrada
      </div>`;
    return;
  }

  const colorClass = type === "pay" ? "value-red" : "value-green";

  list.innerHTML = items
    .map(
      (a) => `
    <div class="account-item anim-slide-in flex items-center gap-2 px-4 sm:px-5 py-3 border-b last:border-b-0 hover:bg-white/5 transition-colors"
         style="border-color: var(--border);">
      <span class="flex-1 text-sm truncate" title="${a.description}" style="color: var(--text);">
        ${a.description}
      </span>
      <span class="font-mono-dm text-sm font-medium min-w-[76px] text-right ${colorClass}">
        ${formatValue(a.value)}
      </span>
      <span class="item-date text-xs min-w-[40px] text-right" style="color: var(--muted);">
        ${formatDate(a.expiry_date)}
      </span>
      <button
        class="badge-${a.paid ? "pago" : "pendente"} text-xs px-2 py-1 rounded-full font-medium cursor-pointer border-0 transition-opacity hover:opacity-75"
        onclick="togglePaid('${type}', ${a.id})">
        ${a.paid ? (type === "pay" ? "pago" : "recebido") : "pendente"}
      </button>
      <button
        class="text-sm px-1 rounded border-0 bg-transparent cursor-pointer transition-colors hover:text-red-400"
        style="color: var(--muted2);"
        onclick="deleteAccount('${type}', ${a.id})"
        title="Remover">x</button>
    </div>
  `,
    )
    .join("");
}

function render() {
  const totalPay = accounts.pay.reduce((sum, a) => sum + a.value, 0);
  const totalReceive = accounts.receive.reduce((sum, a) => sum + a.value, 0);
  const balance = totalReceive - totalPay;
  const pending = [...accounts.pay, ...accounts.receive].filter(
    (a) => !a.paid,
  ).length;
  const paidPay = accounts.pay.filter((a) => a.paid).length;
  const paidReceive = accounts.receive.filter((a) => a.paid).length;

  setText("total-pay", formatValue(totalPay));
  setText("total-receive", formatValue(totalReceive));
  setText(
    "quantity-to-pay",
    `${accounts.pay.length} conta${accounts.pay.length !== 1 ? "s" : ""}`,
  );
  setText(
    "quantity-to-receive",
    `${accounts.receive.length} conta${accounts.receive.length !== 1 ? "s" : ""}`,
  );
  setText("pending-count", pending);

  const balanceEl = document.getElementById("total-balance");
  balanceEl.textContent = formatValue(Math.abs(balance));
  balanceEl.className = `font-mono-dm text-[22px] font-medium leading-none ${balance >= 0 ? "value-green" : "value-red"}`;

  setText("header-pay", formatValue(totalPay));
  setText("header-receive", formatValue(totalReceive));
  setText("footer-pay", formatValue(totalPay));
  setText("footer-receive", formatValue(totalReceive));
  setText(
    "paid-count",
    `${paidPay} paga${paidPay !== 1 ? "s" : ""} / ${accounts.pay.length} total`,
  );
  setText(
    "received-count",
    `${paidReceive} recebida${paidReceive !== 1 ? "s" : ""} / ${accounts.receive.length} total`,
  );

  const balanceBarEl = document.getElementById("balance-bar-value");
  balanceBarEl.textContent = formatValue(Math.abs(balance));
  balanceBarEl.style.color = balance >= 0 ? "var(--green)" : "var(--red)"; // CSS transition handles smooth color change

  setText(
    "balance-detail",
    balance > 0
      ? `Superavit de ${formatValue(balance)}`
      : balance < 0
        ? `Deficit de ${formatValue(Math.abs(balance))}`
        : "Saldo equilibrado",
  );

  if (initialized) {
    animatePop("total-pay");
    animatePop("total-receive");
    animatePop("pending-count");
    animatePop("total-balance");
    animatePop("balance-bar-value");
  }

  renderList("pay");
  renderList("receive");
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function animatePop(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("pop");
  void el.offsetWidth; // force reflow to restart the animation
  el.classList.add("pop");
  el.addEventListener("animationend", () => el.classList.remove("pop"), {
    once: true,
  });
}

function setupEnterKey() {
  ["pay", "receive"].forEach((type) => {
    ["desc", "value"].forEach((field) => {
      document
        .getElementById(`${field}-${type}`)
        .addEventListener("keydown", (e) => {
          if (e.key === "Enter") addAccount(type);
        });
    });
  });
}

// Exposed globally because they are called from inline onclick attributes in the HTML.
window.addAccount = addAccount;
window.togglePaid = togglePaid;
window.deleteAccount = deleteAccount;
window.logout = () => {
  localStorage.removeItem("auth_token");
  window.location.replace("/login.html");
};

document.addEventListener("DOMContentLoaded", () => {
  dpPay = createDatepicker("pay");
  dpReceive = createDatepicker("receive");
  setupEnterKey();
  render();
  initialized = true;
});
