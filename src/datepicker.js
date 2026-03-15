const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function createDatepicker(type) {
  const wrap    = document.getElementById(`dp-${type}`);
  const trigger = document.getElementById(`dp-${type}-trigger`);
  const textEl  = document.getElementById(`dp-${type}-text`);
  const input   = document.getElementById(`date-${type}`);
  const popup   = document.getElementById(`dp-${type}-popup`);
  const grid    = document.getElementById(`dp-${type}-grid`);
  const label   = document.getElementById(`dp-${type}-label`);
  const prevBtn = document.getElementById(`dp-${type}-prev`);
  const nextBtn = document.getElementById(`dp-${type}-next`);
  const clearBtn = document.getElementById(`dp-${type}-clear`);

  // Move o popup para o body para escapar de containers com transform (animações)
  document.body.appendChild(popup);

  const now = new Date();
  let view = { y: now.getFullYear(), m: now.getMonth() };
  let selected = null;

  function renderGrid() {
    label.textContent = `${MONTHS[view.m]} ${view.y}`;
    grid.innerHTML = "";

    DAYS.forEach((d) => {
      const el = document.createElement("div");
      el.textContent = d;
      el.className = "text-center text-[10px] py-1";
      el.style.color = "var(--muted)";
      grid.appendChild(el);
    });

    const firstDay = new Date(view.y, view.m, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(document.createElement("div"));
    }

    const total = new Date(view.y, view.m + 1, 0).getDate();
    for (let d = 1; d <= total; d++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = d;

      const isToday =
        d === now.getDate() &&
        view.m === now.getMonth() &&
        view.y === now.getFullYear();
      const isSel =
        selected &&
        d === selected.d &&
        view.m === selected.m &&
        view.y === selected.y;

      btn.className =
        "text-center text-[11px] rounded-md py-[5px] border-0 outline-none cursor-pointer transition-colors duration-100";

      if (isSel) {
        btn.style.cssText = "background: var(--accent); color: #fff; font-weight: 500;";
      } else if (isToday) {
        btn.style.cssText = "background: transparent; color: var(--accent); font-weight: 600;";
        btn.onmouseenter = () => (btn.style.background = "rgba(255,255,255,0.08)");
        btn.onmouseleave = () => (btn.style.background = "transparent");
      } else {
        btn.style.cssText = "background: transparent; color: var(--text);";
        btn.onmouseenter = () => (btn.style.background = "rgba(255,255,255,0.06)");
        btn.onmouseleave = () => (btn.style.background = "transparent");
      }

      btn.addEventListener("click", () => pick(d, view.m, view.y));
      grid.appendChild(btn);
    }
  }

  function pick(d, m, y) {
    selected = { d, m, y };
    const dd = String(d).padStart(2, "0");
    const mm = String(m + 1).padStart(2, "0");
    input.value = `${y}-${mm}-${dd}`;
    textEl.textContent = `${dd}/${mm}/${y}`;
    textEl.style.color = "var(--text)";
    close();
  }

  function open() {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popupWidth = Math.min(Math.max(rect.width, 224), window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 8));

    popup.style.width = `${popupWidth}px`;
    popup.style.left = `${left}px`;

    if (spaceBelow < 260 && rect.top > 260) {
      popup.style.top = "";
      popup.style.bottom = `${window.innerHeight - rect.top + 4}px`;
    } else {
      popup.style.bottom = "";
      popup.style.top = `${rect.bottom + 4}px`;
    }

    popup.classList.remove("hidden");
    renderGrid();
  }

  function close() {
    popup.classList.add("hidden");
  }

  function reset() {
    selected = null;
    input.value = "";
    textEl.textContent = "Selecionar";
    textEl.style.color = "";
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.contains("hidden") ? open() : close();
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (--view.m < 0) { view.m = 11; view.y--; }
    renderGrid();
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (++view.m > 11) { view.m = 0; view.y++; }
    renderGrid();
  });

  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    reset();
    renderGrid();
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target) && !popup.contains(e.target)) close();
  });

  window.addEventListener("scroll", close, true);
  window.addEventListener("resize", close);

  return { reset };
}
