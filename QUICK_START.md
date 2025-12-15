# ⚡ QUICK START - FIX & TEST CHECKLIST (15.12.2025)

## 🔴 RIGHT NOW (09:30-10:30)

### Step 1: Tell Codex to Fix index.ts
```
Go to: https://github.com/Keksiczek/Lean-rpg-complete/issues/3
Comment: @Codex please fix this issue
Wait for PR in 15-30 minutes
```

### Step 2: Once PR Created
```bash
# Option 1: Merge via GitHub UI
# Click "Merge pull request" → "Confirm merge"

# Option 2: Local merge
git fetch origin
git checkout main
git pull origin main
```

---

## 🔍 DETAILED CODE REVIEW - PR #4 IMPROVEMENTS

### index.ts Changes: Before vs After

**BEFORE (problematic):**
```typescript
// Duplicate route definitions
app.use("/quests", verifyToken, questRoutes);
app.use("/api/quests", verifyToken, questRoutes);
// ... repeated patterns

// Duplicate imports
import { verifyToken } from "./middleware/auth.js";
import { config } from "./config.js";
import { requestLogger } from "./middleware/logger.js";
// ... then imported AGAIN below

// Multiple app.listen() calls
app.listen(PORT, HOST, () => { ... });
// ... and again later

registerGeminiProcessor(geminiService);
// Called AFTER app started, not at startup
```

**AFTER (fixed):**
```typescript
// Single entry point
import { app } from "./app.js";

// Initialization order:
// 1. Connect Redis
// 2. Start submission worker
// 3. REGISTER GEMINI PROCESSOR HERE (before listening)
registerGeminiProcessor(geminiService);

// 4. Single app.listen() call
const server = app.listen(PORT, HOST, () => {
  logger.info({ message: "Server started", port: PORT, host: HOST });
});

// 5. Graceful shutdown with error handling
const shutdown = async (signal: string) => {
  logger.info({ message: "shutdown_initiated", signal });
  server.close(async () => {
    try {
      const queue = getSubmissionQueue();
      logger.info("Draining job queue...");
      await queue.drain();
      logger.info("Job queue drained");
    } catch (error) {
      logger.error({
        message: "queue_drain_failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    await closeQueue();
    await closeRedis();
    logger.info("Shutdown complete");
    process.exit(0);
  });
};
```

**Why this matters (Lean reasoning):**
- ✅ **Single Source of Truth**: Routes defined once in `app.js`, imported cleanly
- ✅ **Correct Initialization Order**: Gemini processor registered BEFORE server listens
- ✅ **Resilient Shutdown**: Queue drain with try-catch prevents data loss
- ✅ **No Race Conditions**: One app.listen() call, not multiple

---

### health.ts Changes: New Type Safety

**NEW TYPES (backend/src/types/health.ts):**
```typescript
export type OverallStatus = "healthy" | "degraded" | "unhealthy";
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface SubsystemHealth {
  status: "connected" | "error" | "stopped";
  latency_ms: number;
  error?: string;
}

export interface MemoryUsageMb {
  used_mb: number;
  rss_mb: number;
  heap_mb: number;
}

export interface QueueHealth {
  status: "running" | "stopped";
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface HealthPayload {
  status: OverallStatus;
  timestamp: string;
  database: SubsystemHealth;
  redis: SubsystemHealth;
  queue: QueueHealth;
  gemini: {
    circuit_breaker: CircuitState;
    failures: number;
    last_failure: string | null;
  };
  memory: MemoryUsageMb;
  uptime_seconds: number;
  hostname: string;
  requestId?: string;
}
```

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-15T10:00:00.000Z",
  "database": {
    "status": "connected",
    "latency_ms": 2.3
  },
  "redis": {
    "status": "connected",
    "latency_ms": 0.8
  },
  "queue": {
    "status": "running",
    "waiting": 2,
    "active": 1,
    "completed": 45,
    "failed": 0
  },
  "gemini": {
    "circuit_breaker": "CLOSED",
    "failures": 0,
    "last_failure": null
  },
  "memory": {
    "used_mb": 156,
    "rss_mb": 284,
    "heap_mb": 400
  },
  "uptime_seconds": 127,
  "hostname": "desktop-prod",
  "requestId": "abc123def456"
}
```

---

## ✅ VERIFY FIX (10:15-10:45)

### 📊 SETUP: 4 Terminály + Browser

**Před startem si přečti:** [ERROR_COLLECTION_GUIDE.md](./docs/ERROR_COLLECTION_GUIDE.md)

```
Terminal 1: Backend Dev Server (npm run dev)
Terminal 2: Frontend Dev Server (npm run dev)
Terminal 3: Real-time Logs (docker-compose logs -f)
Terminal 4: Manual API Testing (curl)
Browser:   Chrome DevTools (F12)
```

### Terminal 1: Build Backend
```bash
cd backend
npm run build 2>&1 | tee build-log.txt

# Expected outcome:
# Option A: ✅ SUCCESS
# Option B: ❌ TypeScript errors (pre-existing, not from PR #4)
```

### Terminal 2: Start Backend
```bash
cd backend  
npm run dev 2>&1 | tee backend-session.log

# Wait for message:
# "✓ Server started on localhost:4000"
```

### Terminal 3: Monitor Health Endpoint
```bash
curl http://localhost:4000/health -v

# Expected output:
HTTP/1.1 200 OK
{
  "status": "healthy",
  "database": { "status": "connected", "latency_ms": 2.3 },
  "redis": { "status": "connected", "latency_ms": 0.8 },
  "queue": { "status": "running", ... },
  "gemini": { "circuit_breaker": "CLOSED", ... }
}
```

### If ✅ All Good
Go to "COLLECT ERRORS" section below

### If ❌ Still Broken
```bash
# Check logs for error messages
docker-compose logs -f backend | grep -i error

# Post error on GitHub Issue #3
# Include full error message + stack trace
# Tag @Codex
```

---

## 📝 COLLECT ERRORS (11:00-13:00)

**Širší guide:** [ERROR_COLLECTION_GUIDE.md](./docs/ERROR_COLLECTION_GUIDE.md)

### Terminal 1: Backend (keep running)
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Opens http://localhost:3000
```

### Terminal 3: Logs
```bash
cd backend
npm run logs  # or: docker-compose logs -f backend
```

### Terminal 4: Browser DevTools
```
1. Open http://localhost:3000 in browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Go to Network tab
5. Trigger app actions (login, submit quest, etc)
6. Take screenshots of errors
```

### What to Document

V každém souboru dokumentuj:

**STARTUP_ERRORS.md**
```markdown
# Startup Errors (15.12.2025)

## Backend Startup
- [ ] npm run dev starts without errors
- Error: [if any]

## Health Endpoint
- [ ] GET /health returns 200
- Status: [ok/unhealthy]

## Frontend Startup  
- [ ] npm run dev compiles
- Errors: [if any]
```

**API_ERRORS.md**
```markdown
# API Errors (15.12.2025)

## ERROR #1: Login Fails
- Endpoint: POST /api/auth/login
- Status: [401/500/...]
- Error: [message]
- Expected: [what should happen]
```

**CONSOLE_ERRORS.md**
```markdown
# Frontend Console Errors (15.12.2025)

## ERROR #1: TypeError on Dashboard Load
- File: components/Dashboard.tsx:45
- Error: [stack trace]
- Trigger: Page load
```

**PERF_ISSUES.md**
```markdown
# Performance Issues (15.12.2025)

## Slow API Calls
- GET /api/quests: 5000ms (timeout at 30s)
- POST /submissions: 15000ms (slow)
```

### Commands to Find Errors

```bash
# Search backend logs for ERROR
grep -i ERROR backend-session.log

# Search for failed API calls
grep -i "failed\|error\|undefined" frontend-errors.log

# Get backend status
curl http://localhost:4000/health

# Test login endpoint
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}' \
  -v
```

---

## 🎯 PRIORITIZE BUGS (13:00-14:00)

### Create: BUG_PRIORITY_LIST.md

```markdown
# Bug Priority List

| # | Impact | Freq | Complex | Score | Bug | Notes |
|---|--------|------|---------|-------|-----|-------|
| 1 | 3 | 1 | 1 | 3.0 | Login fails | Blocks all users |
| 2 | 3 | 1 | 2 | 1.5 | Submissions error | Can't submit |
| 3 | 3 | 3 | 2 | 4.5 | Status polling timeout | Feedback never arrives |
```

**Scoring Formula**:
```
SCORE = (IMPACT × FREQUENCY) / COMPLEXITY

IMPACT:     1=small, 2=medium, 3=blocks app
FREQUENCY:  1=rare, 2=sometimes, 3=always
COMPLEXITY: 1=easy, 2=medium, 3=hard
```

**Example**:
- Bug blocks entire dashboard (IMPACT=3)
- Happens once at load (FREQUENCY=1)  
- Likely JWT validation issue (COMPLEX=1)
- **SCORE = 3×1/1 = 3.0** ⭐⭐⭐ TOP PRIORITY

---

## 🔧 FIX BUGS (14:00-17:00)

### For Each Bug in Priority Order

#### Step 1: Create GitHub Issue

```markdown
## 🐛 BUG: [Brief Title]

**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium

### Description
[What's broken]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[Should do X]

### Actual Behavior  
[Does Y instead]

### Error Message
\`\`\`
[Full error / stack trace]
\`\`\`

### Files Involved
- [ ] File1.ts
- [ ] File2.ts

@Codex please investigate and fix this
```

#### Step 2: Tag Codex

Comment on issue:
```
@Codex please fix this issue.

Reference: This is bug #[X] from priority list.
Root cause analysis: [Your notes]
```

#### Step 3: Wait for PR

Codex will:
1. Analyze root cause
2. Create PR with fix
3. You'll get GitHub notification

#### Step 4: Test Locally

```bash
# Get the branch name from PR
git fetch origin
git checkout [pr-branch]

# Rebuild
cd backend
npm run build
npm run dev

# Test the specific scenario
curl http://localhost:4000/api/[endpoint]

# Browser test if applicable
```

#### Step 5: Approve & Merge

In GitHub UI:
1. Click "Approve"
2. Click "Merge pull request"
3. Back to main: `git checkout main && git pull origin main`

---

## 📈 DAILY PROGRESS TRACKING

### End of TODAY (15.12)

- [ ] Issue #3 merged (index.ts fixed)
- [ ] Backend builds without errors
- [ ] Backend starts on port 4000  
- [ ] Health endpoint returns 200
- [ ] STARTUP_ERRORS.md created
- [ ] API_ERRORS.md created
- [ ] CONSOLE_ERRORS.md created
- [ ] BUG_PRIORITY_LIST.md created
- [ ] Top 3 issues have GitHub Issues
- [ ] Codex started fixing issue #1

### End of TOMORROW (16.12)

- [ ] Issue #1 merged
- [ ] Issue #2 merged  
- [ ] Issue #3 merged
- [ ] At least 50% of bugs fixed
- [ ] API endpoints mostly working
- [ ] Frontend can connect to backend

### End of THURSDAY (17.12)

- [ ] 80% of bugs fixed
- [ ] Core gameplay working
- [ ] All critical issues resolved
- [ ] Ready for demo/testing

---

## 🚨 IF SOMETHING BREAKS

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Revert last merge
git log --oneline | head -5  # Find bad commit
git revert [commit-hash]

# Back to safe state
npm run build
npm run dev
```

### TypeScript errors
```bash
npm run build
# Read error message carefully
# Usually it's a typo or missing import
```

### Can't connect to backend from frontend
```bash
# Check CORS config
# Check frontend API URL
# Verify backend is actually running
curl http://localhost:4000/health
```

### Redis/Database errors
```bash
# Check docker services
docker-compose ps

# Check Redis
docker-compose exec redis redis-cli ping
# Should respond: PONG

# Check database
docker-compose exec postgres psql -U user -d db
```

---

## 🎯 QUICK COMMANDS

```bash
# Build backend
cd backend && npm run build

# Start backend dev
cd backend && npm run dev

# Start frontend dev
cd frontend && npm run dev

# View backend logs
docker-compose logs -f backend

# Test API
curl http://localhost:4000/health

# View all services
docker-compose ps

# Reset database
cd backend && npm run db:reset

# Kill all processes
pkill -f "node"
pkill -f "ts-node"
```

---

## 📞 COMMON ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| "Port 4000 already in use" | Old server running | `pkill -f "node"` |
| "Cannot find module" | Missing dependency | `npm install` |
| "ECONNREFUSED" | Backend not running | Start backend in terminal |
| "401 Unauthorized" | No JWT token | Check auth middleware |
| "CORS error" | Frontend/backend mismatch | Check CORS_ORIGIN env var |

---

## ✅ SUCCESS CHECKLIST

When you see this = All is working:

```
✅ npm run build passes
✅ npm run dev shows "Server started"
✅ curl /health returns 200 OK
✅ Browser DevTools shows no red errors
✅ Frontend can make API calls
✅ Logs show clean startup (no ERROR lines)
```

---

## 🌟 NEXT STEPS (when ready)

### If PR #4 Works ✅
1. Merge to backend/fix → main
2. Start frontend
3. Collect API errors
4. Document in error MD files
5. Create GitHub Issues for each error
6. Let Codex fix them one by one

### If TypeScript Build Fails ⚠
1. Create Issue #5 with error details
2. Tag @Codex to investigate
3. Meanwhile, test if npm run dev works anyway
4. Continue to frontend testing
5. Codex can fix build issues separately

### Code Quality Improvements in PR #4
- ✅ Follows DRY principle (single app factory)
- ✅ Proper initialization order (no race conditions)
- ✅ Type-safe health checks (structured logging)
- ✅ Resilient shutdown (error handling on drain)
- ✅ Clear separation of concerns (app.ts vs index.ts)

---

**Last Updated**: 15.12.2025, 09:55 CET  
**PR #4 Status**: ✅ Created, awaiting merge  
**Next Check-in**: After merge & health endpoint test (10:45 CET)  
**Codex: Excellent work on this refactor! 🚀**