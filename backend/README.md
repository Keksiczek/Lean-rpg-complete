# Lean RPG Training App - Backend

Node.js + TypeScript backend skeleton for the Lean RPG Training App. Uses Express, Prisma, and SQLite (for local development) and is prepared for future Google Gemini integration.

## Prerequisites
- Node.js (LTS recommended)
- npm

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
3. Run database migration (creates `dev.db` locally):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Environment variables are listed in `.env.example`. Copy it to `.env` and adjust as needed.

## Project Structure
- `src/index.ts` – Express server entrypoint with routes and middleware wiring.
- `src/routes/` – Route handlers for auth, users, quests, submissions, and areas.
- `src/middleware/auth.ts` – JWT authentication middleware.
- `src/lib/prisma.ts` – Prisma client singleton.
- `prisma/schema.prisma` – Database schema and Prisma setup.

## API Endpoints (overview)
- `GET /health` – Health check.
- `POST /auth/signup` – Create user and return JWT.
- `POST /auth/login` – Login and return JWT.
- `GET /users/me` – Get current user profile (requires auth).
- `GET /areas` – List areas (requires auth).
- `POST /areas` – Create area (admin only; requires auth).
- `GET /quests` – List active quests (requires auth).
- `POST /quests/assign` – Assign quest to current user (requires auth).
- `GET /quests/my` – List current user's quests with submissions (requires auth).
- `POST /submissions` – Create submission for a quest (requires auth).

## Notes
- Future integration with Google Gemini for AI feedback is planned (see TODO comments in submission routes).
- Default port is `4000` (configurable via `.env`).
