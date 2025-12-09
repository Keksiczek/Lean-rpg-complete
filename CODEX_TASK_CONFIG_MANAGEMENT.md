# 🔧 CODEX SPEC: Configuration Management
## Fáze 2, Task 1 – Config System

**Datum**: 2025-12-09  
**Priorita**: 🔴 CRITICAL (first thing to implement)  
**Status**: Ready for Codex  
**Čas**: ~3-4 hodiny  

---

## 📌 KONTEKT

Po schválení PR #4 budeme chtít všechny environment variables správně validovat při startu. Bez toho se aplikace spustí s špatnými nastavením a bude to nightmare debugovat.

**Lean přístup**: Fail fast. Pokud chybí `JWT_SECRET` → error hned při startu, ne po 3 hodinách v produkci.

---

## 🎯 CÍL

Vytvořit **centralizovaný config systém** kterýž:
1. ✅ Validuje environment variables při startu (Zod schema)
2. ✅ Poskytuje type-safe config přes celou aplikaci
3. ✅ Snadný přístup: `config.JWT_SECRET`, `config.PORT`, atd.
4. ✅ Rozlišuje dev/prod/test envs
5. ✅ Výchozí hodnoty kde dává smysl
6. ✅ Error message jasný pokud chybí proměnná

---

## 📋 KONKRÉTNÍ IMPLEMENTACE

### 1. UPDATE: `backend/src/config.ts`

**Soubor**: `backend/src/config.ts`

**Obsah** (kompletní implementace):

```typescript
import dotenv from "dotenv";
import { z } from "zod";

// Load .env soubor
dotenv.config();

// ============ ZOD SCHEMA ============
const configSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .describe("SQLite connection string, e.g., file:./dev.db"),

  // JWT Authentication
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .describe("Secret key for JWT signing, min 32 chars"),
  JWT_EXPIRY: z.string().default("1h").describe("JWT token expiry, e.g., 1h, 7d"),

  // Server
  PORT: z
    .string()
    .pipe(z.coerce.number())
    .default("4000")
    .describe("Server port"),
  HOST: z
    .string()
    .default("localhost")
    .describe("Server host"),

  // Redis (pro job queue)
  REDIS_URL: z
    .string()
    .default("redis://localhost:6379")
    .describe("Redis connection URL"),

  // Gemini AI
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required for AI features")
    .describe("Google Gemini API key"),
  GEMINI_TIMEOUT: z
    .string()
    .pipe(z.coerce.number())
    .default("30000")
    .describe("Gemini API timeout in ms"),
  GEMINI_MAX_RETRIES: z
    .string()
    .pipe(z.coerce.number())
    .default("3")
    .describe("Max retry attempts for Gemini API"),

  // Logging
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug"])
    .default("info")
    .describe("Log level"),

  // Optional: CORS
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .describe("Allowed CORS origin"),
});

// ============ CONFIG EXPORT ============
type Config = z.infer<typeof configSchema>;

let config: Config;

try {
  config = configSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Configuration Validation Error:");
    error.errors.forEach((err) => {
      const path = err.path.join(".");
      const message = err.message;
      console.error(`   ${path}: ${message}`);
    });
    process.exit(1);
  }
  throw error;
}

// ============ EXPORT ============
export { config };
export type { Config };
```

**Vysvětlení klíčových částí:**

```typescript
// 1. ZNODE ENV
NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
// → Jen povolené hodnoty, default "development"

// 2. REQUIRED PROMĚNNÉ (bez default)
DATABASE_URL: z
  .string()
  .min(1, "DATABASE_URL is required")
  .describe("..."),
// → Pokud chybí → ERROR při startu

// 3. OPTIONAL S DEFAULT
PORT: z
  .string()
  .pipe(z.coerce.number())
  .default("4000"),
// → Pokud chybí → použije "4000", převede na číslo

// 4. MIN LENGTH VALIDACE
JWT_SECRET: z
  .string()
  .min(32, "JWT_SECRET must be at least 32 characters"),
// → Pokud je kratší → ERROR

// 5. TYPE COERCION
GEMINI_TIMEOUT: z
  .string()
  .pipe(z.coerce.number())
  .default("30000"),
// → Čte jako string, převede na number
```

---

### 2. UPDATE: `backend/.env.example`

**Soubor**: `backend/.env.example`

**Obsah:**

```env
# ============================================
# Lean_RPG Backend Configuration
# ============================================
# Copy this file to .env and fill in values
# Required fields MUST be set
# Optional fields have defaults (see config.ts)

# ============ DATABASE ============
# SQLite connection string for development
# Format: file:./path/to/db.db
DATABASE_URL=file:./dev.db

# ============ AUTHENTICATION ============
# JWT secret for signing tokens
# REQUIRED: Min 32 characters
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-key-min-32-chars-keep-this-safe-in-prod

# JWT token expiry time
# Format: e.g., 1h, 7d, 24h
JWT_EXPIRY=1h

# ============ SERVER ============
# Node environment
# Options: development, production, test
NODE_ENV=development

# Server port
PORT=4000

# Server host
HOST=localhost

# ============ REDIS (Job Queue) ============
# Redis connection URL for Bull queue
# Local dev: redis://localhost:6379
# Production: use Redis Cloud or similar
REDIS_URL=redis://localhost:6379

# ============ GEMINI AI ============
# Google Gemini API key
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Gemini API timeout in milliseconds
# Default: 30000ms (30 seconds)
# Adjust if Gemini is slow in your region
GEMINI_TIMEOUT=30000

# Max retry attempts for Gemini API
# Default: 3 retries
GEMINI_MAX_RETRIES=3

# ============ LOGGING ============
# Log level
# Options: error, warn, info, debug
# dev: use "debug", prod: use "warn" or "info"
LOG_LEVEL=info

# ============ CORS ============
# Allowed CORS origin
# Dev: http://localhost:3000
# Prod: https://yourdomain.com
CORS_ORIGIN=http://localhost:3000
```

**Poznámky k .env.example:**
- Jasně naděleny sekce (DATABASE, AUTH, SERVER, atd.)
- Komentáře vysvětlují co je povinné vs. optional
- Příklady formátu
- Instrukce jak generovat JWT_SECRET

---

### 3. UPDATE: `backend/src/index.ts`

**Kde**: Top souboru, HNED na začátku

```typescript
// ====== index.ts (top) ======

import { config } from "./config.js";

// Ihned po importu config se validuje
// Pokud chybí něco → error + exit(1)
// Pokud je OK → app pokračuje

console.log(`🚀 Starting Lean_RPG Backend`);
console.log(`   Environment: ${config.NODE_ENV}`);
console.log(`   Port: ${config.PORT}`);
console.log(`   Database: ${config.DATABASE_URL}`);
console.log(`   Log Level: ${config.LOG_LEVEL}`);

// ... zbytek kodu ...
```

---

### 4. USAGE: Jak se config používá v app

**Příklady kde se config používá:**

```typescript
// ====== src/lib/gemini.ts ======
import { config } from "../config.js";

export async function callGemini(prompt: string): Promise<string> {
  // Používej config hodnoty
  const timeout = config.GEMINI_TIMEOUT;
  const maxRetries = config.GEMINI_MAX_RETRIES;
  const apiKey = config.GEMINI_API_KEY;
  
  // ... implementation ...
}

// ====== src/index.ts ======
import express from "express";
import { config } from "./config.js";

const app = express();
const port = config.PORT;
const host = config.HOST;

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`);
});

// ====== src/middleware/logger.ts ======
import { config } from "../config.js";
import winston from "winston";

const logger = winston.createLogger({
  level: config.LOG_LEVEL, // ← z config
  // ... rest ...
});
```

---

## ✅ ACCEPTANCE CRITERIA

### Code Quality
- [ ] `npm run build` projde bez errors
- [ ] TypeScript: `config` je full type-safe (IntelliSense works)
- [ ] Žádné hardcoded values (vše z config)

### Validation
- [ ] Pokud chybí `DATABASE_URL` → ERROR s jasnou zprávou
- [ ] Pokud chybí `JWT_SECRET` → ERROR s jasnou zprávou
- [ ] Pokud chybí `GEMINI_API_KEY` → ERROR s jasnou zprávou
- [ ] Pokud je `JWT_SECRET` kratší než 32 znaků → ERROR s jasnou zprávou
- [ ] Pokud je `NODE_ENV` invalid → ERROR s možnostmi (development/production/test)

### Defaults
- [ ] `NODE_ENV` defaultuje na "development" pokud není set
- [ ] `PORT` defaultuje na 4000 pokud není set
- [ ] `REDIS_URL` defaultuje na "redis://localhost:6379"
- [ ] `JWT_EXPIRY` defaultuje na "1h"
- [ ] `LOG_LEVEL` defaultuje na "info"

### Type Safety
- [ ] `config.PORT` je `number` (ne string)
- [ ] `config.GEMINI_TIMEOUT` je `number`
- [ ] `config.GEMINI_MAX_RETRIES` je `number`
- [ ] `config.NODE_ENV` je literal type `"development" | "production" | "test"`
- [ ] `config.LOG_LEVEL` je literal type `"error" | "warn" | "info" | "debug"`

### Documentation
- [ ] `.env.example` má všechny proměnné s komentáři
- [ ] `config.ts` má JSDoc komentáře na každém poli (`.describe()`)
- [ ] README zmíní `.env.example`

---

## 🚀 TESTOVÁNÍ

**Jak by měl Codex testovat:**

```bash
# Test 1: Správná .env
cp .env.example .env
npm run build  # Should work

# Test 2: Chybí DATABASE_URL
# Smaž DATABASE_URL z .env
npm run build  # Should ERROR: "DATABASE_URL is required"

# Test 3: JWT_SECRET je krátký
# Nastav JWT_SECRET=short
npm run build  # Should ERROR: "must be at least 32 characters"

# Test 4: NODE_ENV je invalid
# Nastav NODE_ENV=invalid
npm run build  # Should ERROR: "must be one of development, production, test"

# Test 5: Config je accessible v runtime
# V app kódu: console.log(config.PORT) // Should print 4000
npm run dev  # Check console output
```

---

## 📊 STRUKTURA ERRORS

**Pokud chybí DATABASE_URL:**

```
❌ Configuration Validation Error:
   DATABASE_URL: DATABASE_URL is required
   GEMINI_API_KEY: GEMINI_API_KEY is required
```

**Pokud je JWT_SECRET krátký:**

```
❌ Configuration Validation Error:
   JWT_SECRET: JWT_SECRET must be at least 32 characters
```

---

## 🔗 DEPENDENCIES

Již by měly být v package.json (z Phase 1):
- ✅ `zod` – schema validation
- ✅ `dotenv` – načtení .env

Pokud nejsou, Codex přidá:
```bash
npm install zod dotenv
npm install --save-dev @types/node
```

---

## 📝 POZNÁMKY PRO CODEX

1. **Order is important**: Config.ts musí být importován HNED na začátku index.ts, aby se validoval při startu

2. **Export both**: 
   - `export { config }` – aktuální config object
   - `export type { Config }` – TypeScript type pro lidi kteří chtějí psát typované funkce

3. **Error handling**: Když se validace selže, řetěz `process.exit(1)` – to je správně, app se nesmí spustit s špatným config

4. **ENV variables in Docker**: V docker-compose se .env passuje přes `env_file` nebo přes `environment` section

5. **Backward compatibility**: Po PR #4 se config.ts už používá, ale je minimální. Teď to zlepšíme a rozšíříme bez toho, aby se něco rozbilo.

---

## ✨ LEAN REASONING

**Proč je config management important?**

- 🏭 **Factory thinking**: Config je základ. Bez něho se všechno zhroutí.
- ⚡ **Fail Fast**: Pokud chybí JWT_SECRET → error na startu, ne za 2 hodiny v produkci
- 🔒 **Security**: Žádné hardcoded secrets v kódu
- 📈 **Scalability**: Snadné migrovat z dev → prod, jen změníš .env
- 👨‍💻 **Developer Experience**: Type-safe config, IntelliSense works

---

## 📌 TIMELINE

- Setup (zod schema, dotenv): **30 min**
- Testing (all edge cases): **30 min**
- Documentation (.env.example, comments): **20 min**
- **Total**: ~1.5 hodin (+ 2 hodiny reserve)

---

**Vytvořeno**: 2025-12-09  
**Pro**: Codex Coding Agent  
**Priority**: 🔴 CRITICAL (do jako FIRST v Task 1)  
**Status**: Ready ✅
