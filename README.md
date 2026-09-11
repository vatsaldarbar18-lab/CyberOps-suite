# CyberOps Suite

CyberOps Suite is a safe full-stack cybersecurity operations dashboard for a college technical-event demonstration. It has real account authentication, role-based admin access, user-owned scan history, and a professional dark SOC-style UI. It does not perform real network scanning, exploitation, device access, or offensive-security actions.

## Working Features

- Public landing page, registration, login, logout, and persistent cookie session handling.
- Real roles: `user` and `admin`, verified by the backend before protected data is returned.
- User dashboard, URL security review, password tools, scan history, profile, settings, reports, notifications, network sample data, and Linux learning center.
- Admin dashboard with database-backed user counts, scan counts, risk overview, recent users, and recent activity.
- Admin-only user management showing non-sensitive profile data only.
- Per-user scan history and preferences. Normal users cannot read another user's records through the API.
- Password analyzer stores only derived audit metadata. Raw passwords are never stored.
- Optional Supabase PostgreSQL persistence, with local ignored demo storage when Supabase is not configured.

## Technology Stack

- Frontend: React, Vite, Tailwind CSS v4, React Router
- UI: Recharts, Lucide React, Framer Motion
- Backend: Node.js HTTP server using built-in Node APIs
- Database: Supabase PostgreSQL via PostgREST, or local demo JSON fallback
- Auth: first-party backend sessions, scrypt password hashing, HTTP-only session cookie
- Deployment: free Node hosting such as Render plus Supabase free tier if cloud persistence is needed

## Project Structure

```text
src/
  components/        Shared layout, route guards, cards, charts, state panels
  context/           Auth provider and session state
  data/              Safe sample demonstration datasets
  pages/             Public, user, and admin route pages
  services/          Frontend API client
server/
  auth.js            Password hashing, validation, cookie/session helpers
  security.js        Local URL and password analysis logic
  storage.js         Supabase/local persistence layer
  server.js          API and production static server
database/
  schema.sql         PostgreSQL tables and RLS setup
scripts/
  create-admin.mjs   Secure initial admin creation helper
  dev.mjs            Starts frontend and backend together
```

## Local Setup

```bash
npm install
npm run dev
```

Open the Vite URL, usually `http://127.0.0.1:5173`.

For a production-style local run:

```bash
npm run build
npm run start
```

Then open `http://127.0.0.1:4174`.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Environment Variables

Copy `.env.example` to `.env`.

```text
API_HOST=127.0.0.1
API_PORT=4174
APP_ORIGIN=http://127.0.0.1:5173
SESSION_DAYS=7
AUTH_COOKIE_SECURE=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-server-side-key
ADMIN_NAME=CyberOps Admin
ADMIN_EMAIL=admin@example.edu
ADMIN_PASSWORD=replace-with-a-strong-password
```

Set `AUTH_COOKIE_SECURE=true` for HTTPS deployment. Never expose `SUPABASE_SERVICE_ROLE_KEY` as a `VITE_*` browser variable.

## Database Setup

1. Create a free Supabase project.
2. Run `database/schema.sql` in the Supabase SQL editor.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the server environment.
4. Restart the server.

The schema includes `profiles`, `auth_credentials`, `auth_sessions`, `scan_history`, `password_audits`, and `app_preferences`. RLS is enabled and no public table policies are created; the backend uses server-side credentials and enforces authentication, role checks, and `user_id` filtering.

## Admin Setup

Normal registration always creates `role=user`. To create the initial administrator, set admin values only in your local/deployment environment and run:

```bash
npm run admin:create
```

Do not commit real admin credentials. Alternatively, register a normal account and manually promote it in Supabase SQL:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where email = 'admin@example.edu';
```

## Development Commands

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run build
npm run start
npm run preview
npm run admin:create
```

## Free Deployment

1. Push the repo to GitHub.
2. Create a Render Web Service from the repo.
3. Build command: `npm install && npm run build`.
4. Start command: `npm run start`.
5. Add environment variables in Render.
6. Use Supabase free tier for durable PostgreSQL persistence.

Without Supabase, the app still runs with local demo storage, but data may reset when the host restarts or redeploys.

## Known Limitations

- URL analysis is a safe local review of URL structure and configuration signals; it does not contact or scan the target.
- Network, vulnerability, and SOC dashboard datasets are clearly sample/demo data.
- Local fallback storage is useful for offline demos but is not durable production storage.
- PDF export uses the browser print/save flow.
- Admin management is intentionally limited to viewing users and activity.
- The production build may show a non-blocking chunk-size warning from chart/UI dependencies.

## Security Notes

- No plaintext passwords are stored.
- Passwords are hashed with scrypt and per-user salts.
- Session cookies are HTTP-only and same-site strict.
- Password analyzer inputs are processed in memory only.
- Normal users cannot assign themselves admin during registration.
- Admin APIs require an authenticated admin role.
- User history and preferences are filtered by authenticated user ID on the backend.
- Raw stack traces, tokens, password hashes, and service keys are not returned to the browser.
