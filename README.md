# Admin Boilerplate

A React + TypeScript admin panel boilerplate — auth/RBAC, i18n (EN/AR + RTL),
a generic data grid, and a set of business modules built as a copy-paste
template for new ones. Backend-independent by default (mock data layer),
architected so a future Next.js migration is a lift, not a rewrite.

## Stack

React 19 · TypeScript · Vite · Material UI · Tailwind (utilities only,
no preflight) · TanStack Query · Zustand · React Router (file-based-style
routes, lazy-loaded) · React Hook Form + Zod · ApexCharts · FullCalendar ·
i18next · MSAL (optional, lazy-loaded)

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Default demo logins (see `src/lib/auth/mock-users.ts`):
- `admin@example.com` / `password` — full permissions
- `staff@example.com` / `password` — reduced permissions

## Environment variables

All env vars are declared and Zod-validated in `src/lib/env.ts` — anything
not listed there is rejected at startup with a clear error. Feature flags
(`src/lib/feature-flags.ts`) are derived from env vars:

| Flag | Purpose |
|---|---|
| `VITE_FEATURE_USE_MOCK_DATA` | Serve mock data instead of hitting a real API |
| `VITE_FEATURE_USER_REGISTRATION` | Show/allow the self-registration screen |
| `VITE_FEATURE_MS_SSO_ONLY` | Disable email/password login, MS SSO only |
| `VITE_FEATURE_BACKEND_NAV` | Fetch sidebar nav from `/nav` instead of the static config |
| `VITE_FEATURE_BACKEND_RBAC` | Signal that a real backend also enforces RBAC (FE always enforces it either way) |

Setting `VITE_MSAL_CLIENT_ID` / `VITE_MSAL_TENANT_ID` / `VITE_MSAL_REDIRECT_URI`
enables real Microsoft SSO + Graph (Mail/OneDrive) access — see
[Auth & Microsoft SSO](#auth--microsoft-sso) below. Leave them blank to run
entirely on the mock auth layer.

## Architecture

```
src/
├── app/            # router, top-level providers, top-level pages (login, dashboard, 403/404)
├── modules/        # one folder per business module — the unit of reuse
│   └── <name>/
│       ├── api/       # TanStack Query hooks + the module's resource client
│       ├── components/# list page, detail page, module-specific widgets
│       ├── types/      # FE-facing type + raw/backend-facing type
│       ├── mock/        # demo fixture data (raw shape)
│       └── routes.tsx    # lazy-loaded route definitions for this module
├── components/      # generic, reusable, app-wide components (DataGrid, forms, layout, feedback)
├── layouts/          # sidebar/topbar shell + nav config
├── lib/              # env, feature flags, auth/RBAC, api-client, stores, i18n glue
├── i18n/              # i18next config + locale JSON (en/ar)
└── theme/              # MUI theme (light/dark, LTR/RTL)
```

### Adding a new module

Copy `src/modules/leads/` end to end and rename. That gives you:
- a `Raw` type (backend shape) and a clean FE type, connected by a `transform` function
- a resource client from `createResourceClient` (mock-or-real `list/getById/create/update/remove`, no extra code needed)
- a list page built on `AdvancedDataGrid`
- a detail page built on `DetailWidget` + `Timeline`
- a `routes.tsx` using React Router's lazy route field

Wire the new `routes.tsx` into `src/app/routes/router.tsx` behind a
`RequireRoutePermission`, and add the nav entry (with its permission key)
to `src/layouts/nav-config/static-nav-items.ts`. Add any new permission
keys to `permissionGroups` in `src/lib/auth/types.ts` so they show up on
the admin Permissions page.

### The data layer (backend independence)

Every module's API is a thin wrapper around `createResourceClient`
(`src/lib/api-client/create-resource-client.ts`). While
`VITE_FEATURE_USE_MOCK_DATA=true`, it runs an in-memory version of
filter/sort/paginate against the module's mock fixtures. Flip that flag
off and the exact same function signature hits a real REST endpoint
instead — nothing above this layer (components, hooks, pages) needs to
change. The `transform` function passed into `createResourceClient` is
the seam that maps a real backend's field names/shapes onto what the
frontend expects.

### AdvancedDataGrid

`src/components/data-grid/AdvancedDataGrid.tsx` is the one grid used
everywhere. One config object gets you: RHF-based collapsible filters
(with saved presets), server- or client-side sort/pagination, row
selection + bulk actions, a permission-gated row menu, permission-gated
columns, export/send-by-mail toolbar buttons, column visibility toggle,
density toggle, URL-synced state (bookmarkable/shareable), loading
skeletons, and empty/error states. See
`src/modules/leads/components/LeadsListPage.tsx` for the fullest example
of the config shape.

### Auth & Microsoft SSO

- Mock auth (`src/lib/auth/auth-service.ts`) is what runs by default —
  plain email/password against `mock-users.ts`.
- Real Microsoft SSO (`src/lib/auth/msal-login.ts` + `msal-config.ts`)
  activates automatically once the `VITE_MSAL_*` env vars are set. It's
  intentionally kept out of the main bundle via dynamic `import()` — an
  unconfigured deployment never downloads `@azure/msal-browser`.
- RBAC is enforced on the frontend regardless of backend status:
  `RequirePermission` (component-level) and `RequireRoutePermission`
  (route-level) both check `useAuthStore`'s permission set, which comes
  from the signed-in user's roles. Manage roles/permissions on the
  in-app Permissions page (`/permissions`).

### Mail & File Manager

Both are built against `src/lib/graph/graph-client.ts`, a thin axios
instance separate from the main API client (different auth — an
MSAL-issued Graph token, not your own backend's JWT). Like every other
module, they run on mock data by default; once MSAL is configured, the
graph client's token provider is wired automatically (see
`MsalAppProvider`), and the two `real Graph call` branches in
`mail-api.ts` / `files-api.ts` take over.

### i18n

English/Arabic resources live in `src/i18n/locales/`. The app currently
bundles them locally — swap the `resources` block in `src/i18n/index.ts`
for Tolgee's i18next backend plugin (`@tolgee/i18next`) once
`VITE_TOLGEE_API_URL`/`VITE_TOLGEE_API_KEY` are set, so translators can
edit copy in-context on the running app without a redeploy. RTL is
handled automatically (MUI theme direction + a stylis RTL plugin) when
the active language is in `rtlLanguages` (`src/i18n/index.ts`).

## Scripts

```bash
npm run dev       # start dev server
npm run build      # type-check (tsc -b) + production build
npm run lint         # oxlint
npm run preview        # preview a production build locally
```
