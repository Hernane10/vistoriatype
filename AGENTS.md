# AGENTS.md

## What this project is

VistorIA — an offline-first property-inspection SPA (Vite + React + TS, Tailwind).
All product logic runs in the browser; data lives in **IndexedDB** (`src/lib/storage.ts`, Dexie).
There is **no API server, no local database and no required secret**. Supabase and Netlify are
optional third-party integrations, not part of the local stack.

## Run it here (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build   # web entry point on host port 3000
docker compose -f docker-compose.base44.yml logs -f web      # dev server + live compilation
docker compose -f docker-compose.base44.yml down
```

One service (`web`, `node:22`) bind-mounts the checkout at `/app` and runs
`npm ci` + `vite` from source, so edits appear through HMR without rebuilding an image.
`node_modules` lives in the Docker volume `web_node_modules`, never in the checkout.

## Non-obvious things worth knowing

- **Host allowlist (why the preview would otherwise be blank).** Vite ≥ 5.4.12 rejects requests
  whose `Host` header is not allowed with `403 Blocked request`. The sandbox proxy forwards
  `Host: <port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN`. `vite.config.ts` therefore appends
  `.${BASE44_SANDBOX_HOST_DOMAIN}` to `server.allowedHosts` **only when
  `BASE44_PREVIEW_MODE === "1"`**, keeping Vite's default localhost entries in every case.
  Vite 5 does *not* support the newer `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var (it is
  passed through compose but is a no-op here) — the config file is what makes the preview work.
- **Supabase is optional and must never block startup.** `src/lib/supabaseClient.ts` creates the
  client only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are both set; `src/lib/supabase.ts`
  re-exports that client (it used to call `createClient()` unconditionally at import time, which threw
  `supabaseUrl is required` and blanked the whole app offline — `CalendarSimples` imports it).
  Every consumer null-checks `supabase`: the "Nuvem" button shows *desativada* and the calendar's
  cloud scheduling is disabled instead of crashing.
- **Secrets are delivered by the platform** to `/run/base44/app.env` (wired as the last `env_file:`
  entry in compose). Do not create a repo `.env` for them, and do not put these keys under compose
  `environment:` — that would outrank the dashboard value. Keys: `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY` (Supabase → Settings → API; cloud sync of vistorias, requires the
  `supabase/schema.sql` table + "Anonymous Sign-ins" enabled) and `VITE_NETLIFY_TOKEN`
  (Netlify personal access token; publishing a laudo as a public link).
- Vite reads `VITE_*` variables from the process environment at dev-server start, so supplying them
  via `env_file` works without a `.env` file.

## Verifying a change

- `docker compose -f docker-compose.base44.yml exec web sh -c "npm run type-check"` runs first, but the
  repo has **pre-existing** type errors in `DetailView/*`, `ModelosTab`, `NewInspectionView` — compare
  against that baseline instead of expecting a clean run.
- Storage/report flows are best checked by hand in the preview: create a vistoria in the wizard
  ("Nova vistoria" → "Finalizar"), go back to the list, then delete it with the trash button. Records
  are in IndexedDB (`vistoria-ia` → `kv`, keys `insp:<id>` and `inspections-index`).
