# 🔍 GUIDE: Sbírání Errorů Při Běhu (Error Collection Guide)

**Cíl:** Systematicky sbírat všechny chyby - API, frontend, backend, network.

---

## 📋 SETUP: 4 TERMINÁLY + 1 BROWSER

```
Terminal 1: Backend Dev Server
Terminal 2: Frontend Dev Server  
Terminal 3: Logs Monitoring
Terminal 4: Manual API Testing
Browser:   DevTools + Network Inspector
```

---

## 🔴 TERMINAL 1: Backend Dev Server

```bash
cd backend
npm run dev
```

**Co pozorovat:**
- Startup zprávy
- "✓ Server started on localhost:4000"
- Jakékoliv ERROR: linky
- Warnings (žluté)

**Když se něco pokazí:**
```bash
# Full error context
npm run dev 2>&1 | tee backend-session.log

# Potom můžeš analyzovat:
grep "ERROR" backend-session.log
grep "error" backend-session.log
```

---

## 🟢 TERMINAL 2: Frontend Dev Server

```bash
cd frontend
npm run dev
```

**Co pozorovat:**
- Compilation success/failure
- "➜  Local:   http://localhost:3000"
- Warnings (žluté)
- Module resolution errors

**Spustíš POTOM co je backend ready!**

---

## 🔵 TERMINAL 3: Real-Time Logs (Docker)

```bash
# Kombinovaný přehled všech služeb
docker-compose logs -f

# NEBO konkrétně backend
docker-compose logs -f backend

# NEBO konkrétně postgres
docker-compose logs -f postgres

# NEBO redis
docker-compose logs -f redis
```

**Filtrování:**
```bash
# Jen errory
docker-compose logs backend | grep -i error

# Poslednich 100 řádků
docker-compose logs -f backend --tail=100

# Jen poslední 5 minut
docker-compose logs -f backend --since 5m
```

---

## 🟡 TERMINAL 4: Manual API Testing

### 1️⃣ Test Health Endpoint (nejdřív!)

```bash
curl -X GET http://localhost:4000/health \
  -H "Content-Type: application/json" \
  -v

# -v = verbose (ukazuje headers, response code, atd)
```

**Očekávaný výstup:**
```json
HTTP/1.1 200 OK

{
  "status": "healthy",
  "database": { "status": "connected", "latency_ms": 2.5 },
  "redis": { "status": "connected", "latency_ms": 1.2 },
  ...
}
```

**Možné problémy:**
```
❌ Connection refused → Backend neběží
❌ 503 Service Unavailable → Database/Redis není dostupný
❌ Invalid JSON → Server crashed nebo vrací HTML error
```

### 2️⃣ Test Auth Endpoints

```bash
# GET current user (s auth tokenem)
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v

# POST login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v

# Capture response pro analýzu
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v > login-response.txt 2>&1
```

### 3️⃣ Test Quest Endpoints

```bash
# GET all quests (needs token)
curl -X GET http://localhost:4000/api/quests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v

# POST submission
curl -X POST http://localhost:4000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"questId":"1","content":"My answer"}' \
  -v
```

---

## 🌐 BROWSER: Chrome DevTools

### Kroky:

```
1. Otevři http://localhost:3000 v prohlížeči
2. Stiskni F12 (otevře DevTools)
3. Vyber: Console tab + Network tab (2 okna vedle sebe)
```

### Console Tab 🔴

**Hledej:**
- `console.error()` (červené zprávy)
- `console.warn()` (žluté zprávy)
- `Uncaught TypeError: ...`
- `Failed to fetch ...`

**Export:**
```javascript
// V Console skriptu:
console.save = function(data, filename) {
  const str = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);
  const exportFileDefaultName = filename || 'console.json';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Pak:
console.save(window.errors, 'console-errors.json');
```

### Network Tab 🌍

**Sloupce k monitorování:**
```
Method   | Status | URL                      | Type    | Size    | Time
---------|--------|--------------------------|---------|---------|------
GET      | 200    | /health                  | fetch   | 1.2 KB  | 45ms
POST     | 401    | /api/auth/login          | fetch   | 0.5 KB  | 12ms  ← PROBLEM!
GET      | 404    | /api/users/me            | fetch   | 0.8 KB  | 8ms   ← PROBLEM!
```

**Hledej RED (chyby):**
```
❌ 4xx status codes (401, 404, 422, 500)
❌ CORS errors (network tab says "blocked by CORS policy")
❌ Failed requests (no response)
```

**Pro každý RED request:**
```
1. Klikni na request
2. Jdi na "Response" tab → zkopíruj error message
3. Jdi na "Headers" tab → zkopíruj Request/Response headers
4. Jdi na "Preview" tab → zkopíruj formatted response
```

---

## 📝 SBÍRÁNÍ ERRORŮ: Postupně

### FÁZE 1: Startup Errors (2-3 minuty)

```bash
# Terminal 1 - Backend start
npm run dev

# Zaznamenáš:
✅ nebo ❌ "Server started on localhost:4000"
❌ TypeScript compilation errors
❌ Module not found errors
❌ Connection errors (DB, Redis)
```

**Zápis:** Do `STARTUP_ERRORS.md`

### FÁZE 2: Health Check (1 minuta)

```bash
# Terminal 4 - Health test
curl http://localhost:4000/health -v

# Zaznamenáš:
✅ nebo ❌ Status 200
❌ Database error
❌ Redis error
❌ Queue error
```

**Zápis:** Do `HEALTH_CHECK_ERRORS.md`

### FÁZE 3: Frontend Load (30 sekund)

```bash
# Terminal 2 - Frontend start
npm run dev

# Browser - DevTools Console tab
# Zaznamenáš:
❌ JavaScript errors
❌ Fetch failures
❌ Module errors
```

**Zápis:** Do `FRONTEND_STARTUP_ERRORS.md`

### FÁZE 4: User Interactions (5-10 minut)

V prohlížeči:
```
1. Zkus login
2. Zkus create account
3. Zkus view dashboard
4. Zkus submit answer
5. Zkus view profile
```

**Při každé akci:**
- Sleduj Network tab (red requests?)
- Sleduj Console tab (errors?)
- Zaznamenej co se stalo

**Zápis:** Do `INTERACTION_ERRORS.md`

---

## 📄 TEMPLATE: Jak Dokumentovat Error

### Format:

```markdown
## ERROR #N: [Brief Title]

**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**When it happens:**
- Action: [Co dělal uživatel]
- Component: [Která součást]
- Step: [Krok v procesu]

**Error Message:**
\`\`\`
[Full error text]
[Stack trace if available]
\`\`\`

**HTTP Details (if API error):**
- URL: `GET /api/users/me`
- Status: `401 Unauthorized`
- Headers: Content-Type: application/json
- Response Body:
\`\`\`json
{ "error": "Invalid token" }
\`\`\`

**Console Output (if JS error):**
\`\`\`
TypeError: Cannot read property 'data' of undefined
  at Dashboard.tsx:45
  at React.createElement
\`\`\`

**Expected Behavior:**
[Co by mělo být správně]

**Actual Behavior:**
[Co se stalo špatně]

**Files Involved:**
- backend/src/routes/auth.ts
- frontend/src/components/Dashboard.tsx

**Possible Root Cause:**
[Tvoje hypotéza]

**Steps to Reproduce:**
1. [Krok 1]
2. [Krok 2]
3. [Krok 3]
```

---

## 🎯 KONKRÉTNÍ PŘÍKLADY

### ❌ Příklad 1: Login API Error

```bash
# Terminal 4:
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass"}' \
  -v

# Output:
HTTP/1.1 401 Unauthorized
{
  "error": "Invalid credentials",
  "code": "AUTH_FAILED"
}
```

**Zápis:**
```markdown
## ERROR #1: Login Returns 401

**Severity**: 🔴 Critical

**When it happens:**
- Action: User clicks "Login" button
- API: POST /api/auth/login
- Status: 401 Unauthorized

**Error Message:**
\`\`\`json
{ "error": "Invalid credentials", "code": "AUTH_FAILED" }
\`\`\`

**Expected:** User logged in, token returned
**Actual:** 401 error, no token

**Possible Cause:** 
- Credentials validation broken
- Database not returning user
- Hash comparison failing
```

### ❌ Příklad 2: Frontend Console Error

```
Uncaught TypeError: Cannot read property 'data' of undefined
  at Dashboard.tsx:45:12
  at React.createElement
  at Suspense.tsx:22:5
```

**Zápis:**
```markdown
## ERROR #2: Dashboard Crash on Load

**Severity**: 🔴 Critical

**When it happens:**
- Component: Dashboard.tsx
- Line: 45
- Trigger: Page load

**Error Message:**
\`\`\`
TypeError: Cannot read property 'data' of undefined
  at Dashboard.tsx:45:12
\`\`\`

**Expected:** Dashboard shows player data
**Actual:** Page crashes with error

**Code Context:**
Line 45: const { xp, level } = data.player;
Problem: data is undefined

**Possible Cause:**
- API request failed but no error handling
- Response format unexpected
```

### ❌ Příklad 3: Network Error

```
GET /api/quests
Status: 504 Gateway Timeout
```

**Zápis:**
```markdown
## ERROR #3: Quest API Timeout

**Severity**: 🟠 High

**When it happens:**
- Route: /quests
- API call: GET /api/quests
- After: ~30 seconds

**HTTP Details:**
- Status: 504 Gateway Timeout
- Time: 30000ms

**Expected:** Quests loaded in <500ms
**Actual:** 504 after 30s timeout

**Possible Cause:**
- Database query too slow
- Missing index on quests table
- N+1 query problem
```

---

## 🚀 AUTOMATED ERROR CAPTURE

### Backend: Capture to File

```bash
# Terminal 1: Save all backend output
cd backend
npm run dev 2>&1 | tee -a backend-session-$(date +%Y%m%d-%H%M%S).log

# Potom analyzuj:
grep -i "error\|fail\|warn" backend-session-*.log
```

### Frontend: Capture Console

```javascript
// Add to frontend App.tsx or main.tsx
const originalError = console.error;
const errors = [];

console.error = function(...args) {
  errors.push({
    timestamp: new Date().toISOString(),
    message: args.join(' '),
    stack: new Error().stack
  });
  originalError.apply(console, args);
};

// At end of session, export:
window.capturedErrors = errors;
```

### Browser: Export from Console

```javascript
// V DevTools Console:
JSON.stringify(window.capturedErrors, null, 2)

// Copy & paste do souboru:
// frontend-errors.json
```

---

## 📊 SUMMARY: Co Sbírat

| Source | Co | Jak | Zápis |
|--------|-------|------|-------|
| **Backend startup** | Server logs | Terminal output | STARTUP_ERRORS.md |
| **Backend health** | API response | curl | HEALTH_ERRORS.md |
| **Frontend startup** | Build/console | Terminal + F12 | FRONTEND_STARTUP_ERRORS.md |
| **API calls** | Status + response | Network tab | API_ERRORS.md |
| **Console errors** | JS exceptions | Console tab | CONSOLE_ERRORS.md |
| **Performance** | Latency | Network tab timing | PERF_ISSUES.md |

---

## ✅ CHECKLIST: Na Konci Dne

- [ ] Backend starts bez critical errors
- [ ] Health endpoint vrací 200
- [ ] Frontend starts bez compilation errors
- [ ] Network tab: <10% requests s error statusem
- [ ] Console tab: <5 uncaught errors
- [ ] STARTUP_ERRORS.md existuje
- [ ] HEALTH_ERRORS.md existuje
- [ ] API_ERRORS.md existuje
- [ ] CONSOLE_ERRORS.md existuje
- [ ] Všechny errors kategorized a dokumentovány

---

**Jak Pokračovat:**

1. **Sbírání:** Následuj tento guide
2. **Dokumentace:** Sepiš všechny errory do MD souborů
3. **Prioritizace:** Dej do GitHub Issues (tag @Codex)
4. **Opravy:** Čekej na PR od Codexa
5. **Testování:** Ověř že je opraveno

**Trvání:** ~1 hodina na sbírání + 5 minut zápisu