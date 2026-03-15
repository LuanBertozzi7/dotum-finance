# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto do projeto

Desafio de recrutamento da empresa **Dotum** (Pimenta Bueno - RO) para a vaga de desenvolvedor back-end. O front-end já está implementado. O candidato deve construir uma API back-end que substitua o estado em memória do front-end atual.

**Requisitos do desafio:**
- Lançamento de contas a pagar e a receber (descrição, valor, data de vencimento)
- Cada conta deve ter: `id` (autoincremento), `description`, `value`, `expiry_date`, `paid` (boolean)
- Visualização do total de contas a pagar, total a receber e saldo geral (receber − pagar)
- Ao concluir, publicar o código em repositório GitHub público e enviar o link

## Comandos

```bash
npm run dev      # Inicia o servidor de desenvolvimento (Vite)
npm run build    # Build de produção
npm run preview  # Pré-visualiza o build de produção
```

Não há suite de testes configurada.

## Arquitetura

App de página única em JavaScript puro — sem framework. Stack: Vite + Tailwind CSS v4.

**Estado e fluxo de dados:** Todo o estado vive em `src/main.js` num único objeto em memória `accounts = { pay: [], receive: [] }`. Não há persistência — os dados são resetados ao recarregar a página. O back-end deverá substituir esse estado.

**Renderização:** A função `render()` em `main.js` recalcula todos os valores derivados (totais, saldo, contadores) e chama `renderList()` para cada painel, que substitui o `innerHTML` via interpolação de strings. Os IDs do DOM em `index.html` são o contrato entre o HTML e o JS.

**Funções globais:** `addAccount`, `togglePaid` e `deleteAccount` são explicitamente expostas em `window` para que os atributos `onclick` do `index.html` possam chamá-las.

**`src/date.js`:** IIFE independente que implementa um calendário popup customizado. Está hardcoded para o input `#date-pay` — o painel de "receber" usa um `<input type="date">` nativo.

**Estilização:** `src/style.css` importa o Tailwind v4 e define CSS custom properties (`--red`, `--green`, `--amber`, `--accent`, `--surface`, `--border`, `--muted` etc.) usadas tanto no CSS quanto em atributos `style=` inline no HTML. Classes de componentes customizados (`stat-card`, `field-input`, `badge-pendente`, `badge-pago`, `anim-*`, `value-red`, `value-green`, `value-amber`) estão definidas aqui.

**Localização:** Interface em português (pt-BR). Moeda formatada como BRL via `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`. Datas exibidas no formato `DD/MM`.
