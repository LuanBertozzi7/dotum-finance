/**
 * ========================================
 * Dotum Finance - Dashboard Application
 * ========================================
 *
 * Main application logic for the financial dashboard.
 *
 * ARCHITECTURE:
 * - Single-page app (SPA) with client-side routing
 * - All data synced with backend API (Node.js + Express + SQLite)
 * - JWT authentication via localStorage token
 * - Reactive UI updates via render() function
 *
 * DATA FLOW:
 * 1. Login (login.js) → stores JWT token in localStorage
 * 2. Page load → apiCall() retrieves token from localStorage
 * 3. loadAccounts() → GET /api/accounts → populates local state
 * 4. User interaction (add/edit/delete) → POST/PUT/DELETE → loadAccounts()
 * 5. render() → updates DOM with new data
 *
 * KEY CONCEPTS:
 * - apiCall(): Helper function that attaches JWT token to all requests
 * - loadAccounts(): Fetches data from server and syncs local state
 * - render(): Pure function that generates UI from state (no API calls)
 */

import { createDatepicker } from "./datepicker.js";
import { API_BASE_URL } from "./config.js";

// ========================================
// Auth Guard: Protect dashboard from unauthenticated access
// ========================================
// If no JWT token is found in localStorage, user hasn't logged in yet
if (!localStorage.getItem("auth_token")) {
  window.location.replace("/login.html");
}

// ========================================
// UI Component References
// ========================================
// References to custom datepicker instances for both payment panels
let dpPay, dpReceive;
// Flag indicating whether initial render has occurred
// (prevents pop animations from firing on first page load)
let initialized = false;

// ========================================
// Application State
// ========================================
// Global state: accounts organized by type
// Synchronized with server via loadAccounts()
let accounts = { pay: [], receive: [] };

/**
 * Helper function to make authenticated HTTP requests to the API.
 * Automatically attaches JWT token to Authorization header.
 * Throws error if response is not OK (non-2xx status).
 *
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint path (e.g., "/api/accounts")
 * @param {object|null} body - Request body data (will be JSON-stringified)
 * @returns {Promise<object>} Parsed JSON response from API
 */
async function apiCall(method, endpoint, body = null) {
  // Retrieve JWT token from localStorage (set during login)
  const token = localStorage.getItem("auth_token");

  // If no token, user is not authenticated - redirect to login
  if (!token) {
    window.location.replace("/login.html");
    return;
  }

  // Build fetch options with authentication header
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Attach JWT token to request
    },
  };

  // Only include body if data is being sent
  if (body) options.body = JSON.stringify(body);

  // Send HTTP request to API (URL from config.js)
  const apiUrl = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(apiUrl, options);

  // If API returned error status, throw exception
  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  // Return parsed JSON response
  return response.json();
}

/**
 * Fetch all accounts from API and populate local state.
 * Converts database format (0/1 for paid) to JavaScript boolean (true/false).
 * Organizes accounts into { pay: [], receive: [] } structure for UI rendering.
 * Called on app initialization and after any account mutation (add/update/delete).
 */
async function loadAccounts() {
  try {
    // Fetch accounts array from API
    const accountsArray = await apiCall("GET", "/api/accounts");

    // Initialize empty structure
    accounts = { pay: [], receive: [] };

    // Organize API response into local state structure
    accountsArray.forEach((account) => {
      // Convert database format (0/1) to JavaScript boolean
      const paid = account.paid === 1 ? true : false;
      accounts[account.type].push({
        ...account,
        paid,
      });
    });

    // Update UI with new data
    render();
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
  }
}

/**
 * Formats a numeric value as Brazilian Real (BRL) currency.
 *
 * @param {number} value - The numeric value to format.
 * @returns {string} The value formatted as BRL currency (e.g., 1000 → "R$ 1.000,00").
 */
function formatValue(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Converts a date string from "YYYY-MM-DD" format to "DD/MM".
 * Returns "—" if the input is empty or falsy.
 *
 * @param {string} str - The date string in "YYYY-MM-DD" format.
 * @returns {string} The date formatted as "DD/MM" (e.g., "2024-03-19" → "19/03"), or "—" if empty.
 */
function formatDate(str) {
  if (!str) return "—";
  const [, m, d] = str.split("-");
  return `${d}/${m}`;
}

/**
 * Create a new account (payable or receivable) via API.
 * Validates form inputs, sends data to server, clears form, and refreshes account list.
 *
 * @param {string} type - "pay" for accounts payable, "receive" for accounts receivable
 */
async function addAccount(type) {
  // Get references to form elements
  const descriptionEl = document.getElementById(`desc-${type}`);
  const valueEl = document.getElementById(`value-${type}`);
  const dateEl = document.getElementById(`date-${type}`);

  // Extract and normalize form values
  const description = descriptionEl.value.trim();
  const value = parseFloat(valueEl.value);
  const expiry_date = dateEl.value;

  // Client-side validation: description is required, value must be positive number
  if (!description || isNaN(value) || value <= 0) {
    // Visual feedback: highlight field with error class for 1 second
    descriptionEl.classList.add("error");
    setTimeout(() => descriptionEl.classList.remove("error"), 1000);
    return;
  }

  try {
    // Send account data to API
    await apiCall("POST", "/api/accounts", {
      type,
      description,
      value,
      expiry_date,
    });

    // Reset form fields
    descriptionEl.value = "";
    valueEl.value = "";
    // Reset datepicker component
    if (type === "pay") dpPay.reset();
    else dpReceive.reset();
    // Return focus to description input for better UX
    descriptionEl.focus();

    // Refresh account list from server to show newly created account
    await loadAccounts();
  } catch (error) {
    console.error("Erro ao adicionar conta:", error);
    // Show error state on form
    descriptionEl.classList.add("error");
  }
}

/**
 * Toggle paid/received status of an account.
 * Inverts the paid status (paid → pending, pending → paid) and syncs to API.
 *
 * @param {string} type - "pay" or "receive"
 * @param {number} id - ID of account to toggle
 */
async function togglePaid(type, id) {
  try {
    // Find account in local state to determine new status
    const account = accounts[type].find((a) => a.id === id);
    if (!account) return;

    // Send update to API (toggle paid status: 0→1 or 1→0)
    await apiCall("PUT", `/api/accounts/${id}`, {
      paid: account.paid ? 0 : 1, // Invert boolean: true→1, false→0
    });

    // Refresh account list from server to ensure UI is in sync
    await loadAccounts();
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
  }
}

/**
 * Delete an account via API.
 * Removes account from database and refreshes local state.
 *
 * @param {string} type - "pay" or "receive"
 * @param {number} id - ID of account to delete
 */
async function deleteAccount(type, id) {
  try {
    // Send delete request to API
    await apiCall("DELETE", `/api/accounts/${id}`);

    // Refresh account list from server to reflect deletion
    await loadAccounts();
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
  }
}

/**
 * Renders account list (payable or receivable) by replacing innerHTML.
 * Each account is displayed as an item with description, value, date, and action buttons.
 *
 * @param {string} type - "pay" or "receive"
 */
function renderList(type) {
  // Map type to corresponding DOM element ID
  const listId = type === "pay" ? "payment-list" : "receive-list";
  const list = document.getElementById(listId);
  const items = accounts[type];

  // If no accounts exist, show empty state
  if (items.length === 0) {
    list.innerHTML = `
      <div class="py-8 text-center text-sm" style="color: var(--muted);">
        Nenhuma conta registrada
      </div>`;
    return;
  }

  // Set value color based on type: red for payable, green for receivable
  const colorClass = type === "pay" ? "value-red" : "value-green";

  // Build HTML for each list item via template literals
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

/**
 * Função principal de renderização: calcula valores derivados do estado
 * e atualiza todos os elementos DOM. Chamada sempre que o estado muda.
 */
function render() {
  // Calcula totais acumulados a partir do estado
  const totalPay = accounts.pay.reduce((sum, a) => sum + a.value, 0);
  const totalReceive = accounts.receive.reduce((sum, a) => sum + a.value, 0);
  const balance = totalReceive - totalPay; // Saldo = receber - pagar

  // Conta contas pendentes e já liquidadas
  const pending = [...accounts.pay, ...accounts.receive].filter(
    (a) => !a.paid,
  ).length;
  const paidPay = accounts.pay.filter((a) => a.paid).length;
  const paidReceive = accounts.receive.filter((a) => a.paid).length;

  // Atualiza painel de pagar
  setText("total-pay", formatValue(totalPay));
  setText(
    "quantity-to-pay",
    `${accounts.pay.length} conta${accounts.pay.length !== 1 ? "s" : ""}`,
  );

  // Atualiza painel de receber
  setText("total-receive", formatValue(totalReceive));
  setText(
    "quantity-to-receive",
    `${accounts.receive.length} conta${accounts.receive.length !== 1 ? "s" : ""}`,
  );

  // Contador de contas pendentes (não pagas)
  setText("pending-count", pending);

  // Atualiza saldo total com cor dinâmica (verde se positivo, vermelho se negativo)
  const balanceEl = document.getElementById("total-balance");
  balanceEl.textContent = formatValue(Math.abs(balance));
  balanceEl.className = `font-mono-dm text-[22px] font-medium leading-none ${balance >= 0 ? "value-green" : "value-red"}`;

  // Atualiza cabeçalho e rodapé com totais
  setText("header-pay", formatValue(totalPay));
  setText("header-receive", formatValue(totalReceive));
  setText("footer-pay", formatValue(totalPay));
  setText("footer-receive", formatValue(totalReceive));

  // Estatísticas de liquidação por tipo
  setText(
    "paid-count",
    `${paidPay} paga${paidPay !== 1 ? "s" : ""} / ${accounts.pay.length} total`,
  );
  setText(
    "received-count",
    `${paidReceive} recebida${paidReceive !== 1 ? "s" : ""} / ${accounts.receive.length} total`,
  );

  // Barra de saldo com cor dinâmica (CSS transition anima a mudança)
  const balanceBarEl = document.getElementById("balance-bar-value");
  balanceBarEl.textContent = formatValue(Math.abs(balance));
  balanceBarEl.style.color = balance >= 0 ? "var(--green)" : "var(--red)";

  // Detalhe descritivo do saldo (superávit, déficit ou equilibrado)
  setText(
    "balance-detail",
    balance > 0
      ? `Superavit de ${formatValue(balance)}`
      : balance < 0
        ? `Deficit de ${formatValue(Math.abs(balance))}`
        : "Saldo equilibrado",
  );

  // Anima valores que mudaram (apenas após a primeira renderização)
  if (initialized) {
    animatePop("total-pay");
    animatePop("total-receive");
    animatePop("pending-count");
    animatePop("total-balance");
    animatePop("balance-bar-value");
  }

  // Renderiza as listas de contas
  renderList("pay");
  renderList("receive");
}

/**
 * Utilidade: atualiza o textContent de um elemento pelo ID.
 * Verifica se o elemento existe antes de atualizar (segurança).
 *
 * @param {string} id - ID do elemento
 * @param {string|number} value - Novo conteúdo de texto
 */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Anima um elemento adicionando/removendo a classe "pop" (efeito de expansão).
 * Force reflow para reiniciar a animação se ela já foi aplicada anteriormente.
 *
 * @param {string} id - ID do elemento a animar
 */
function animatePop(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // Remove a classe para limpar estado anterior
  el.classList.remove("pop");
  // Force reflow: acessa offsetWidth para forçar o navegador a recalcular o layout
  // Isso permite que a animação seja reiniciada mesmo que já tenha sido executada
  void el.offsetWidth;
  // Adiciona a classe novamente para disparar a animação
  el.classList.add("pop");
  // Remove a classe após a animação terminar para deixar o elemento em estado limpo
  el.addEventListener("animationend", () => el.classList.remove("pop"), {
    once: true, // Garante que o listener execute apenas uma vez
  });
}

/**
 * Configura listeners de teclado para permitir submeter formulário com Enter.
 * Aplica a ambos os painéis (pagar e receber) e aos campos de descrição e valor.
 */
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

/* ========================================
 * Exposição global das funções chamadas
 * por atributos `onclick` no HTML
 * ======================================== */
window.addAccount = addAccount;
window.togglePaid = togglePaid;
window.deleteAccount = deleteAccount;

/**
 * Função de logout: limpa o token de autenticação
 * e redireciona para a página de login
 */
window.logout = () => {
  localStorage.removeItem("auth_token");
  window.location.replace("/login.html");
};

/* ========================================
 * App Initialization
 * ======================================== */
/**
 * Initialize app when DOM is ready.
 * Sets up UI components and fetches data from server.
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize datepicker instances for both payment panels
  dpPay = createDatepicker("pay");
  dpReceive = createDatepicker("receive");

  // Attach keyboard listeners for form submission (Enter key)
  setupEnterKey();

  // Fetch accounts from API and populate UI
  // This is the main data sync point - everything comes from server
  await loadAccounts();

  // Set flag to enable animations for future state changes
  // (animations are skipped on first render)
  initialized = true;
});
