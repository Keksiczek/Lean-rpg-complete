# 🔍 TASK 6: Verification & Testing (Local)

**Status:** READY FOR YOU TO RUN ✅  
**Effort:** 1-2 hours  
**Deadline:** ASAP after PR #88 merge

---

## ⚠️ What Happened with PR #88?

Codex created complete test suite + documentation, BUT:

```
❌ Tests can't run in GitHub Actions sandbox
   └─ Reason: npm registry access 403
   └─ Solution: Run tests on YOUR machine (npm works there)

✅ Test code is correct & complete
✅ Config is correct
✅ Documentation is correct
```

**Your Job:** Verify everything works on your local machine.

---

## 📋 Checklist (Copy & Paste)

```bash
# STEP 1: Setup (5 min)
[ ] git clone https://github.com/Keksiczek/Lean_RPG.git
[ ] cd Lean_RPG
[ ] git checkout codex/finalize-multi-tenant-implementation
[ ] cd frontend && npm install

# STEP 2: Verify Tests (10 min)
[ ] npx vitest --version  # Should be v2.1.2
[ ] npm run test  # All pass?
[ ] npm run test:coverage  # > 90% coverage?

# STEP 3: Verify Build (5 min)
[ ] npm run build  # No errors?
[ ] npm run lint  # No errors?

# STEP 4: API Check (10 min) - IF BACKEND RUNNING
[ ] curl http://localhost:3000/api/health
[ ] Test POST /api/admin/tenants (create test tenant)
[ ] Test GET /api/tenants/:slug/config

# STEP 5: Frontend Check (10 min) - IF BACKEND RUNNING
[ ] npm run dev
[ ] Open http://localhost:3001/tenant/test-slug/dashboard
[ ] Check Network tab (API response < 1s?)
[ ] Check Application > localStorage (caching works?)
[ ] Check Console (no errors?)

# STEP 6: Document (10 min)
[ ] Create VERIFICATION_REPORT.md (see template below)
[ ] Add findings to GitHub issue #89
```

---

## 📊 Verification Report Template

Copy toto do `VERIFICATION_REPORT.md` a vyplň:

```markdown
# Verification Report - PR #88 Testing

**Date:** [TODAY]
**Tester:** [YOUR NAME]
**Environment:** [Your OS, Node version, etc.]

## ✅ Test Results

### Unit Tests
- [ ] All tests pass
- [ ] npm run test output:
  ```
  [PASTE OUTPUT HERE]
  ```

### Coverage
- [ ] npm run test:coverage shows > 90%
- [ ] Coverage report:
  ```
  [PASTE SUMMARY HERE]
  ```

### Build
- [ ] npm run build succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors

## 🔌 API Verification (if backend running)

- [ ] curl http://localhost:3000/api/health returns 200
- [ ] Tenant creation works
- [ ] GET /api/tenants/:slug/config returns config

## 🎨 Frontend Verification (if backend running)

- [ ] npm run dev starts on :3001
- [ ] /tenant/:slug/dashboard loads
- [ ] No console errors
- [ ] localStorage has tenant:config:* key
- [ ] API call is < 1s

## 🎯 Final Decision

**Ready to Merge?**
- [ ] YES - All green ✅
- [ ] NO - Issues found (list below)

**Blockers/Issues:**
```
[PASTE ANY ISSUES HERE]
```

**Recommendations:**
```
[ANY NEXT STEPS]
```
```

---

## 🚀 After Verification

### If All Passes ✅
1. Comment on GitHub #88: "Verified locally - all tests pass ✅"
2. Merge PR to `testing` branch
3. Deploy to staging
4. Create TASK 7: Smoke Tests

### If Issues Found ❌
1. Document in GitHub #89
2. Fix in new branch
3. Update PR #88
4. Re-run verification

---

## 📚 Related Files

- [PR #88](https://github.com/Keksiczek/Lean_RPG/pull/88)
- [Issue #89](https://github.com/Keksiczek/Lean_RPG/issues/89) - This TASK
- [Setup Guide](./MULTI_TENANT_SETUP.md)
- [API Spec](./API_SPECIFICATION.md)
- [Architecture](./ARCHITECTURE.md)

---

## 💡 Troubleshooting

### npm install fails
```bash
# Try clear cache
npm cache clean --force
npm install
```

### vitest not found
```bash
# Reinstall dev dependencies
rm -rf node_modules package-lock.json
npm install
```

### Tests fail
```bash
# Run with verbose output
npm run test -- --reporter=verbose

# Run specific test
npm run test -- TenantContext.test.tsx --reporter=verbose
```

### API endpoint 404
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check endpoint exists
curl -i http://localhost:3000/api/tenants/test/config
```

---

**Questions?** Open issue or ask on GitHub.

**Next Step:** TASK 7 - Smoke Tests & Production Deploy 🚀
