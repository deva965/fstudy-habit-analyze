# Study Habit Analyzer — Backend

A full REST API backend for the Study Habit Analyzer frontend (https://study-habit-analyzer.vercel.app). Stores study sessions in PostgreSQL and computes productivity scores, streaks, goal tracking, and subject insights.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from `$PORT`, proxied at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/study-logs.ts` — study_logs table (date, subject, hoursStudied, focusLevel, mood)
- `lib/db/src/schema/goals.ts` — goals table (single row with dailyGoalHours)
- `artifacts/api-server/src/routes/study-logs.ts` — CRUD for study log entries
- `artifacts/api-server/src/routes/analytics.ts` — productivity score, streak, insights, chart data
- `artifacts/api-server/src/routes/goals.ts` — daily goal get/update

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/study-logs` | List all logs (sorted by date desc) |
| POST | `/api/study-logs` | Create a study log entry |
| DELETE | `/api/study-logs` | Clear all study logs |
| DELETE | `/api/study-logs/:id` | Delete one log by ID |
| GET | `/api/analytics` | Productivity score, streak, insights, chart data |
| GET | `/api/goals` | Get daily goal hours (auto-created if missing) |
| PUT | `/api/goals` | Update daily goal hours |

## Database Models

**study_logs** — one row per study session
- `id` (serial PK)
- `date` (date string, YYYY-MM-DD)
- `subject` (text)
- `hours_studied` (real)
- `focus_level` (text: excellent | good | average | low | very_poor)
- `mood` (text: happy | normal | stressed)
- `created_at` (timestamptz)

**goals** — single-row settings table
- `id` (serial PK)
- `daily_goal_hours` (real, default 5)
- `updated_at` (timestamptz)

## Architecture decisions

- Single-user design (no auth): the frontend has no login screens and stores data in localStorage; this backend mirrors that model with a single shared dataset.
- Goals table uses a single-row upsert pattern — `getOrCreateGoal()` ensures a row always exists.
- Analytics computed server-side: productivity score = weighted(focus × hours) / goal × 100 over last 7 days; streak counts consecutive calendar days with any logged session.
- Chart data returns last 30 days bucketed by date for the frontend analytics chart.

## Connecting the frontend

To connect the Study Habit Analyzer frontend to this backend:

1. The API server is available at your Replit dev URL under the `/api` path.
2. In the frontend source, replace all `localStorage` reads/writes with fetch calls to the API endpoints above.
3. Map the frontend's focus level labels to API enum values:
   - "Excellent Focus" → `excellent`
   - "Good" → `good`
   - "Average" → `average`
   - "Low" → `low`
   - "Very Poor" → `very_poor`
4. Map mood labels: "Happy" → `happy`, "Normal" → `normal`, "Stressed" → `stressed`
5. On app load: call `GET /api/study-logs` + `GET /api/analytics` + `GET /api/goals`
6. On "Add Entry": call `POST /api/study-logs`, then refetch analytics
7. On delete icon: call `DELETE /api/study-logs/:id`, then refetch
8. On "Clear All": call `DELETE /api/study-logs`, then refetch
9. On goal change: call `PUT /api/goals`

## User preferences

_Populate as you build._

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Use `date(..., { mode: "string" })` for the date column — not `Date` objects — to avoid timezone shifts
- Goals table auto-seeds on first `GET /goals` call; no manual seed needed
