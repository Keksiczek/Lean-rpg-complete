# 🤖 GOOGLE AI STUDIO - BACKEND GENERATION (12 DEC 2025)

## 📌 SHRNUTÍ

Vytvořil jsem **KOMPLETNÍ BACKEND PROMPT** pro Google AI Studio, který vygeneruje production-ready Express.js backend pro Lean_RPG.

---

## 📁 PŘIPRAVENÉ DOKUMENTY

### 1. `GOOGLE_AI_STUDIO_BACKEND_PROMPT.md` 🔴 HLAVNÍ SOUBOR
- **Co obsahuje:** Kompletní specifikace pro AI Studio
- **Jak velký:** ~3500 řádků detailní dokumentace
- **Co vygeneruje AI Studio:**
  - ✅ src/ (40+ TypeScript files)
  - ✅ prisma/schema.prisma (10+ databázové modely)
  - ✅ 50+ API endpoints
  - ✅ Middleware (auth, validation, error handling)
  - ✅ package.json (všechny dependencies)
  - ✅ Dockerfile (production ready)
  - ✅ docker-compose.yml (dev environment)
  - ✅ README.md (setup guide)

### 2. `HOW_TO_USE_BACKEND_PROMPT.md` 📖 NÁVOD
- **Co je:** Step-by-step guide jak používat prompt
- **Čas potřebný:** 5-10 minut pro čtení
- **Pokrývá:** Copy-paste, installation, verification

---

## 🚀 QUICK START (TERAZ)

### Step 1: Zkopíruj prompt
```bash
cat docs/GOOGLE_AI_STUDIO_BACKEND_PROMPT.md | pbcopy
# (macOS - kopíruje do clipboard)

# Linux/Windows:
cat docs/GOOGLE_AI_STUDIO_BACKEND_PROMPT.md
# (vyber vše, zkopíruj)
```

### Step 2: Jdi na Google AI Studio
```
https://aistudio.google.com/
```

### Step 3: Vlož prompt
```
Chat input → Ctrl+V → ENTER
AI Studio začne generovat...
```

### Step 4: Čekej ~15 minut
AI Studio vygeneruje všechny soubory.

### Step 5: Vytvoř soubory v backend/
```bash
cd ~/Lean_RPG/backend

# Copy-paste content z AI Studio do jednotlivých souborů:
# src/index.ts
# src/config/database.ts
# src/routes/audits.ts
# ... atd
```

### Step 6: Instaluj a spusť
```bash
npm install
npx prisma migrate dev --name "init"
npm run dev
```

### Step 7: Verifikuj
```bash
curl http://localhost:4000/api/health
# Mělo by vrátit: { "status": "ok" }
```

---

## 📊 CO VYGENERUJE AI STUDIO

### Databázové modely (10+)
```
✅ User (s roles: OPERATOR, AUDIT_MANAGER, AUDIT_APPROVER, TENANT_ADMIN)
✅ Tenant (tenant isolation)
✅ Workplace (továrny, oddělení)
✅ ChecklistTemplate (audit šablony)
✅ ChecklistItem (jednotlivé otázky)
✅ AuditSession (instance auditu)
✅ AuditResponse (odpovědi na otázky)
✅ AuditFinding (zjištění/findings)
✅ Submission (Red Tags/action items)
```

### API Endpoints (50+)
```
✅ Authentication (login, register, refresh)
✅ Checklists CRUD (create, read, update, delete, clone, publish)
✅ Audits workflow (start, respond, submit, approve, reject)
✅ Workplaces management (CRUD)
✅ Users management (CRUD, role changes)
✅ Compliance reporting (trends, summaries)
✅ Submissions/Red Tags (CRUD)
```

### TypeScript Features
```
✅ Strict mode (no any)
✅ Full type coverage
✅ Zod validation schemas
✅ Custom error types
✅ Generic controllers/services
```

### Security Features
```
✅ JWT authentication
✅ Role-based authorization (RBAC)
✅ Tenant isolation (all queries filtered)
✅ Password hashing (bcryptjs)
✅ Input validation (Zod schemas)
✅ Global error handler
```

---

## ⏱️ TIMELINE

| Krok | Čas | Co se děje |
|------|-----|----------|
| **1** | 5 min | Kopíruj prompt z tohoto souboru |
| **2** | 1 min | Otevři Google AI Studio |
| **3** | 15 min | AI Studio generuje backend |
| **4** | 10 min | Copy-paste soubory do ~/Lean_RPG/backend |
| **5** | 5 min | npm install |
| **6** | 5 min | Databázové migrace |
| **7** | 2 min | npm run dev (start backend) |
| **8** | 1 min | curl http://localhost:4000/api/health |
| **TOTAL** | ~44 minut | **KOMPLETNÍ BACKEND HOTOV** |

---

## 🎯 JAKÝ JE OBSAH PROMPTU

### Section 1: Task Briefing
- Co máš vygenerovat (backend pro Lean_RPG)
- Tech stack (Express, TypeScript, PostgreSQL, Prisma)

### Section 2: Architecture Requirements
- Přesná folder struktura
- Všechny soubory které mají být
- Popis každého souboru

### Section 3: Database Schema
- Kompletní Prisma schema.prisma
- 10+ modelů (User, Tenant, Workplace, Checklist, Audit, etc.)
- Všechny relationships a constraints
- Správné indexy pro performance

### Section 4: API Endpoints
- 50+ endpointů
- Request/response specifikace
- Authentication requirements
- Query parameters

### Section 5: Middleware & Security
- JWT auth
- RBAC (role-based access)
- Tenant isolation
- Input validation (Zod)
- Error handling

### Section 6: Deployment
- Dockerfile (production ready)
- docker-compose.yml (local dev)
- .env.example (configuration template)

### Section 7: Code Patterns
- Controller przykład
- Service příklad
- Validation příklad

---

## ⚠️ DŮLEŽITÉ POZNÁMKY

### Pro AI Studio
1. **Vyžádej si kompletní kód** - nejen snippety
2. **Všechny soubory** - src/, prisma/, config, etc.
3. **Production-ready** - bez TODO/placeholder komentářů
4. **TypeScript strict** - žádné `any` typy

### Po generování
1. **Zkontroluj TypeScript**: `tsc --noEmit`
2. **Zkontroluj build**: `npm run build`
3. **Zkontroluj DB**: `npx prisma studio`
4. **Spusť server**: `npm run dev`
5. **Test endpoint**: `curl http://localhost:4000/api/health`

### Pokud něco nefunguje
1. Čti error messages (são velmi informativní)
2. Vyžádej si opravy v AI Studio
3. Kontaktuj mě se specifickou chybou

---

## 🔗 KLÍČOVÉ DOKUMENTY V REPO

- **GOOGLE_AI_STUDIO_BACKEND_PROMPT.md** ← Zkopíruj TOTO
- **HOW_TO_USE_BACKEND_PROMPT.md** ← Čti TOTO
- **docs/PHASE1_BACKEND_REALITY_CHECK.md** ← Reference
- **docs/PHASE1_IMPLEMENTATION_PROMPT.md** ← Original spec

---

## ✅ CHECKLIST PŘED SPUŠTĚNÍM

- [ ] Přečetl jsem `HOW_TO_USE_BACKEND_PROMPT.md`
- [ ] Zkopíroval jsem `GOOGLE_AI_STUDIO_BACKEND_PROMPT.md`
- [ ] Mám otevřené Google AI Studio
- [ ] Vložil jsem prompt do chatu
- [ ] Čekám na AI Studio aby vygeneroval
- [ ] Mám připravený textový editor (VS Code, etc.)
- [ ] Připravil jsem si ~/Lean_RPG/backend/src/ folder
- [ ] Mám npm/node nainstalovaný
- [ ] Mám PostgreSQL připravený (nebo docker-compose)

---

## 🚀 KONEČNÝ CÍL

Po 45 minutách budeš mít:

✅ **Kompletní production-ready backend**
✅ **50+ API endpoints**
✅ **PostgreSQL databáze** s 10+ modely
✅ **JWT autentifikace** a RBAC
✅ **Docker deployment** ready
✅ **TypeScript strict mode** bez chyb
✅ **Pronected k integraci s frontendem**

**Pak:** Frontend si bude moci stáhnout data z backendu! 🎉

---

## 📞 POKUD MÁŠE PROBLÉMY

1. **Čti error messages** - jsou super informativní
2. **Viz HOW_TO_USE_BACKEND_PROMPT.md** - sekce "Pokud máte chyby"
3. **Kontaktuj mě** s přesným error textem
4. **Vyžádej si opravy v AI Studio** - "Fix this error: [konkrétní chyba]"

---

## 🎯 PRIORITY

**TERAZ:** Zkopíruj prompt → vloží do AI Studio → Čekej na generování

**JEN POTOM:** Vytváříš soubory a instaluješ

**Timeline:** 45 minut od teď → Máš kompletní backend! ⚡

---

**LET'S BUILD IT! 🚀**
