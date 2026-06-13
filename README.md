# sqlearn-web

Frontend for SQLearn, a gamified SQL learning platform. It provides the learner
interface (curriculum browsing, lessons, an in-browser SQL editor and result
view, progress and gamification, an AI mentor panel) and an admin interface for
managing chapters, lessons, exercises, datasets, badges, and users.

Built with Next.js 16 (App Router, React 19) and TypeScript. SQL editing uses
CodeMirror 6 with the SQL language extension; UI components are built on
shadcn / Base UI and Tailwind CSS v4; client state uses Zustand. It talks to the
`sqlearn-api` backend over `fetch` with cookie-based authentication.

## Prerequisites

- Node.js 20.9 or later (required by Next.js 16)
- npm (a `package-lock.json` is committed)
- A running `sqlearn-api` backend (see that repository's README)

## Setup and run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the backend first so the API is reachable on port 8000. By default the
   frontend calls `http://localhost:8000/api`, so no configuration is needed for
   the standard local setup.

   To point at a different backend, create `.env.local` and set:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Build and run for production

```bash
npm run build
npm run start
```

`npm run lint` runs ESLint.

## How it connects to the backend

The app runs on port 3000 and expects the API at `http://localhost:8000/api`,
configurable via `NEXT_PUBLIC_API_URL` (`src/lib/api.ts`). Requests are sent with
`credentials: "include"` so the httpOnly JWT cookies set by the backend are
carried automatically; the client reads the `csrftoken` cookie and sends it as
the `X-CSRFToken` header on unsafe methods. On a 401 it transparently calls
`/auth/refresh/` once and retries. The backend's `CORS_ALLOWED_ORIGINS` must
include `http://localhost:3000` for these credentialed requests to succeed (it
does by default).

## Project structure

```
src/
  app/
    (public)/   Unauthenticated routes: login, register, password reset, landing
    (app)/      Authenticated app: dashboard, learn, sandbox, leaderboard,
                profile, settings, and the admin section
    layout.tsx  Root layout, fonts, global styles
  components/   Shared and UI components
  lib/          API client (api.ts) and per-domain helpers (auth, curriculum,
                exercises, sandbox, gamification, mentor, admin, users)
  stores/       Zustand stores (auth, mentor)
public/         Static assets
components.json  shadcn configuration
```

This project uses a customized Next.js 16 setup; see `AGENTS.md` for notes on
deviations from older Next.js conventions.
