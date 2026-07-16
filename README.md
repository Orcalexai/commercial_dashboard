# Exam Correction Admin Dashboard

A React (JSX + Vite) admin frontend implementing the two backend guides:

- **Authentication** — browser cookie-based login (`/api/web-token/`), silent
  refresh, and logout, per `frontend-auth-websocket-guide.md`.
- **Dashboard** — the internal admin audit page for the Exam Correction
  Metadata API, per `exam-correction-metadata-api.md`, with filters, page-number
  pagination, and expandable rows.
- **Live notifications** — browser WebSocket to
  `/ws/backend/notifications/` using cookie auth, with the documented close-code
  handling (4001 → refresh + reconnect once, 4002 → stop) and backoff.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

The backend is `https://backend.smartlearners.ai`.

- **Local dev** proxies `/api` and `/ws` through Vite to the backend as
  same-origin requests (see `vite.config.js`), so the HTTP-only auth cookies work
  without CORS/SameSite friction. Override the target with
  `VITE_PROXY_TARGET` if needed.
- **Production** builds call the backend directly. Set `VITE_API_BASE_URL` in
  `.env` (the backend must then send `Access-Control-Allow-Credentials: true`
  and set cookies with `SameSite=None; Secure`).

## How auth works

The web-login flow sets HTTP-only `access_token` / `refresh_token` cookies, so
the JWT is never read in JavaScript. Every API call uses `credentials: "include"`;
a 401 triggers one silent `POST /api/web-token/refresh/` and a retry
(`src/api/client.js`). Auth state is validated on page load by attempting a
refresh (`src/context/AuthContext.jsx`).

> The metadata endpoint is admin-only (`is_staff` / `is_superuser`). Non-admin
> accounts can sign in but the table will show the backend's `403` message.

## Structure

```
src/
  api/client.js              # fetch wrapper, cookie auth, refresh-on-401, endpoints
  context/AuthContext.jsx    # login / logout / session validation
  hooks/useNotifications.js  # WebSocket connection + close-code handling + backoff
  components/
    Login.jsx                # /api/web-token/ login form
    Dashboard.jsx            # layout, data loading, pagination wiring
    FilterBar.jsx            # school_code / teacher / dates / page_size
    MetadataTable.jsx        # table with the recommended columns
    MetadataRow.jsx          # expandable row: rolls, token usage, cost, files
    Pagination.jsx           # next/previous called exactly as returned
    NotificationsPanel.jsx   # branches WS messages by `type`
  utils/format.js            # number / currency / date formatting
```
