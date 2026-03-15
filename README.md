# Dotum Finance

> Desafio técnico para a vaga de **Desenvolvedor Back-end** — [Dotum](https://dotum.com.br/)

Sistema de gerenciamento de contas a pagar e a receber. O nome **Dotum**, a marca e todos os créditos pertencem à empresa [Dotum](https://dotum.com.br/).

---

## Sobre o desafio

O objetivo é desenvolver uma aplicação que permita aos usuários lançar e acompanhar contas financeiras, com os seguintes recursos:

- Lançamento de contas a **pagar** e a **receber** (descrição, valor, data de vencimento)
- Visualização do **total a pagar**, **total a receber** e **saldo geral**
- Marcação de contas como pagas/recebidas
- Remoção de contas

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Markup | HTML5 |
| Estilo | CSS3 + Tailwind CSS v4 |
| Lógica | JavaScript (vanilla, ES Modules) |
| Build | Vite |

---

## Como rodar localmente

```bash
# instalar dependências
npm install

# iniciar servidor de desenvolvimento
npm run dev
# acesse http://localhost:5173

# build de produção
npm run build
```

---

## Estrutura do projeto

```
dotum-finance/
├── index.html          # entrada da aplicação
├── src/
│   ├── main.js         # lógica principal (estado, renderização, DOM)
│   ├── datepicker.js   # componente de calendário customizado
│   └── style.css       # Tailwind + CSS custom properties
└── package.json
```

---

## Créditos

O nome **Dotum**, logotipo e identidade visual são de propriedade exclusiva da [Dotum](https://dotum.com.br/). Este repositório foi desenvolvido exclusivamente como resposta ao desafio técnico de recrutamento e não representa nenhum produto oficial da empresa.
