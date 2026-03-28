## Logres — Knowledge Base em Obsidian

**Localização:** `C:/Users/LuanB/OneDrive/Desktop/Logres/`

**O que é:** Knowledge base pessoal de Luan documentando:
- Perfil e habilidades (backend Node.js, frontend, infraestrutura)
- Projetos em desenvolvimento
- Conhecimento técnico organizado
- Métodos de aprendizado

**Projeto Âncora:** Dotum Finance (desafio de recrutamento)

---

## Dotum Finance — Projeto

**Status:** 🔄 Backend/API em desenvolvimento

**Estrutura:**
- **Frontend:** `/c/developer/dotum-finance/` (Vite + Tailwind + JavaScript)
- **API:** `/c/developer/finance-api/` (Node.js + Express + SQLite + JWT)

**Stack:**
- Frontend: HTML, CSS, Tailwind, JavaScript, Vite
- Backend/API: Node.js, Express, SQLite, JWT, bcrypt

**Melhorias Implementadas (2026-03-21):**
1. ✅ Input Validation com Zod (schemas.js)
2. ✅ Error Messages genéricas (sem vazar informações)
3. ✅ JWT_SECRET obrigatório no startup
4. ✅ Try-catch global em todas operações de DB

**Próximos Passos:**
- Rate limiting em /login e /register
- Validação de força de senha
- CORS separado dev/prod
- Logging estruturado