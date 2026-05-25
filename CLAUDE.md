# CLAUDE.md — Heimdyn Factory App

This file tells Claude how this codebase is structured and what conventions to follow.

---

## What this project is

A **Next.js 15 App Router** generic manufacturing factory dashboard, forked from `factory-saas`. It connects to a **Neon PostgreSQL** database for auth, users, roles, permissions, client/vendor master data, and custom dashboard persistence. All factory analytics data (charts, KPIs, tables) uses **static JSON files** — no external API dependency.

**App name:** `heimdyn-factory-app`
**Brand:** Heimdyn

---

## Architecture overview

```
┌─────────────────────────────────────────────────┐
│  Next.js 15 (App Router)                        │
│                                                 │
│  Client Components                              │
│  ├── Pages (dashboard, production, sales, etc.) │
│  ├── AuthProvider (JWT, localStorage)            │
│  └── services/config.ts (apiClient)             │
│                                                 │
│  API Routes (app/api/*)                          │
│  ├── Auth: /api/auth/* → Neon DB (users table)  │
│  ├── Users: /api/user/* → Neon DB               │
│  ├── Roles: /api/user/role/* → Neon DB          │
│  ├── Clients: /api/clients/* → Neon DB          │
│  ├── Vendors: /api/vendors/* → Neon DB          │
│  ├── Dashboards: /api/dashboards/* → Neon DB    │
│  └── Analytics: /api/production/*, etc. → JSON  │
└─────────────────────────────────────────────────┘
```

**DB-backed:** auth, users, roles, permissions, clients, vendors, custom dashboards
**Static JSON:** all factory analytics (production, material, sales, analysis, KPIs, charts)
**No external FastAPI.** Everything is Next.js API routes.
**No chatbot.** Stripped entirely.

---

## Migration from factory-saas — what to strip

### Remove entirely
- `components/Chatbot.tsx` and any AI query endpoint (`/api/ai-query`)
- `app/db-connection/` page and `/api/db-test` route
- `app/dashboard-2/` page (consolidated into main-dashboard)
- Three.js dependencies (`three`, `@react-three/fiber`, `@react-three/drei`) and any 3D components
- `services/factory.ts`
- All hooks and service functions that called the external FastAPI (OEE, MCE, sensors, machine status, maintenance, operators, operator efficiency, machine downtime, downtime report/log, tickets, power consumption, availability, news, production yield, machine performance)
- `NEXT_PUBLIC_API_BASE_URL` env var

### Remove from `services/config.ts`
- Delete the `apiClient` (external FastAPI client). Keep only `internalApiClient`.
- Rename `internalApiClient` → `apiClient` since it's now the only client.

### Remove from `services/api.ts`
- Delete all service objects that used the old external `apiClient`: `factoryService`, `sensorsService`, `machinesService`, `oeeService`, `mceService`, `machinePerformanceService`, `operatorEfficiencyService`, `productionYieldService`, `machineDowntimeService`, `downtimeReportService`, `downtimeLogService`, `ticketsService`, `operatorsService`, `machineListService`, `newsService`, `powerConsumptionService`, `availabilityService`
- Keep: `authService`, `userService` (these already use `internalApiClient`)

### Remove unused hooks
- `use-factory-overview.ts`, `use-oee.ts`, `use-mce.ts`, `use-machine-performance.ts`, `use-machine-downtime.ts`, `use-operator-efficiency.ts`, `use-production-yield.ts`, `use-power-consumption.ts`, `use-news.ts`, `use-tickets.ts`, `use-tickets-analytics.ts`, `use-status.ts`, `use-inventory.ts`
- Keep: `use-mobile.tsx`, `use-sidebar.tsx`, `use-toast.ts`, `use-production-delivery-gap.ts`, `use-total-cartons-delivered.ts`, `use-blanks-usage-heatmap.ts`, `use-raw-material-summary.ts`
- Update kept hooks to fetch from Next.js API routes (which read JSON)

### Remove unused pages (not in sidebar)
- `app/machines/` (if present)
- `app/downtime-analysis/`
- `app/power-consumption/`
- `app/inventory/`
- `app/tickets/`

---

## Terminology mapping

All paper-cup-specific terms must be replaced with generic manufacturing terms throughout the codebase (components, pages, API routes, JSON data, types, labels, chart titles):

| Old term | New term |
|----------|----------|
| Cartons | Units |
| Blanks | Components |
| Models | Product Lines |
| Dealers | Distributors |
| Salesperson | Sales Rep |
| Paper cups / cups | Products |
| Wastage | Scrap |
| LK Industries | Heimdyn |

Apply this to: page titles, chart labels, axis labels, KPI names, table headers, sidebar labels, widget catalog names, KPI catalog names, JSON data keys, TypeScript interface fields, API route names where applicable.

---

## Static JSON data layer

### Location
All static data files live in `data/` at the project root.

### Pattern
Each analytics API route reads from a corresponding JSON file instead of querying the DB:

```ts
// app/api/production/by-model/route.ts
import { NextResponse } from 'next/server';
import data from '@/data/production-by-product-line.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(data);
}
```

### JSON files to create

**Main Dashboard:**
- `data/main-dashboard/overview.json` — KPI summary (units produced, delivered, gap, material stock)
- `data/main-dashboard/monthly-trend.json` — month-over-month production vs delivery
- `data/main-dashboard/top-components.json` — top components by usage share
- `data/main-dashboard/sales-by-rep.json` — sales rep performance

**Production:**
- `data/production/by-product-line.json` — production by product line (horizontal bar)
- `data/production/shift-comparison.json` — shift-wise units + scrap (grouped column)
- `data/production/scrap-trend.json` — monthly scrap trend (spline)
- `data/production/zero-days.json` — zero-production days list
- `data/production/by-operator.json` — operator-wise output

**Material:**
- `data/material/summary.json` — material stock summary cards
- `data/material/monthly-trend.json` — monthly material consumption trend
- `data/material/by-component.json` — consumption by component type

**Sales:**
- `data/sales/summary.json` — sales KPI cards
- `data/sales/product-mix.json` — product mix breakdown
- `data/sales/order-size.json` — order size distribution
- `data/sales/top-distributors.json` — top distributors
- `data/sales/inactive-distributors.json` — inactive distributor list

**Analysis:**
- `data/analysis/qoq.json` — quarter-over-quarter comparison
- `data/analysis/inventory-buildup.json` — inventory buildup trend
- `data/analysis/yield-by-product-line.json` — yield analysis by product line
- `data/analysis/day-of-week.json` — day-of-week production patterns
- `data/analysis/years.json` — available years for filters

**Make Your Own (dashboard builder):**
- `data/myo/kpi/{kpi-id}.json` — one file per KPI definition
- `data/myo/widget/{widget-id}.json` — one file per widget's chart data

**Seed data (for DB tables):**
- `data/seed/clients.json` — 10-15 dummy clients
- `data/seed/vendors.json` — 10-15 dummy vendors
- `data/seed/users.json` — default users (admin, manager, operator)

### Data style
- Use realistic but clearly fictional company/person names
- Numbers should be plausible for a mid-size manufacturing operation
- Dates should span the last 12 months
- Keep data consistent across files (e.g., same product line names everywhere)

---

## Database — Neon PostgreSQL

### Singleton pool: `lib/db.ts`

```ts
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
export default pool;
```

### Rules
- `lib/db.ts` is the **only** place a `Pool` is created
- DB access is **server-side only** — never inside `'use client'` files
- Always `client.release()` in `finally`
- `DATABASE_URL` lives in `.env.local` — never hardcode or prefix with `NEXT_PUBLIC_`

### DB is used for
- `users` table — auth, user management
- `roles` / `role_permissions` tables — role RBAC
- `clients` table — client master
- `vendors` table — vendor master
- `dashboards` table — custom dashboard persistence (Make Your Own)

### DB is NOT used for
- Any factory analytics data (production, material, sales, analysis) — these use static JSON

---

## DB schema

### Existing table: `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(50) NOT NULL DEFAULT 'operator',
  is_active     BOOLEAN DEFAULT TRUE,
  is_deleted    BOOLEAN DEFAULT FALSE,
  last_login    TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### New table: `clients`
```sql
CREATE TABLE IF NOT EXISTS clients (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  contact_person  VARCHAR(100),
  email           VARCHAR(255),
  phone           VARCHAR(20),
  address         TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### New table: `vendors`
```sql
CREATE TABLE IF NOT EXISTS vendors (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  contact_person  VARCHAR(100),
  email           VARCHAR(255),
  phone           VARCHAR(20),
  category        VARCHAR(100),
  address         TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Existing table: `dashboards` (for Make Your Own persistence)
Already exists from factory-saas migration. Stores per-user custom dashboard layouts.

---

## Auth system

### Flow
```
Login page (/login)
  → POST /api/auth/login (email + password)
    → bcrypt.compare against users.password_hash
    → issue access_token (2h) + refresh_token (7d) via jose
    → return tokens + user object
  → AuthProvider stores in localStorage
  → apiClient attaches Bearer token on requiresAuth calls
  → On 401: clear tokens, redirect to /login
  → On access_token expiry: silent refresh via /api/auth/refresh
```

### Key files
| File | Purpose |
|------|---------|
| `lib/jwt.ts` | `signAccessToken`, `signRefreshToken`, `verifyToken` using jose |
| `lib/auth.ts` | `requireAuth(req)` — extracts + verifies Bearer token, returns user or 401 |
| `lib/auth-server.ts` | `getUserFromRequest(req)` — same but returns null instead of 401 |
| `lib/rate-limit.ts` | In-memory rate limiter for login endpoint |
| `components/AuthProvider.tsx` | Client-side auth context, JWT decode, auto-refresh |
| `components/ConditionalShell.tsx` | Strips sidebar/topnav on `/login` route |
| `app/login/page.tsx` | Split-screen login page |

### API routes
| Route | Method | Purpose | Auth required |
|-------|--------|---------|--------------|
| `/api/auth/login` | POST | Authenticate, return tokens | No |
| `/api/auth/refresh` | POST | Refresh access token | No (uses refresh_token in body) |
| `/api/auth/logout` | POST | Server-side logout (currently no-op) | No |
| `/api/auth/setup` | POST | Create initial admin user (first-run) | No |

### Environment variables
| Variable | Side | Purpose |
|----------|------|---------|
| `DATABASE_URL` | Server | Neon PostgreSQL connection string |
| `JWT_SECRET` | Server | JWT signing secret (min 32 chars) |

---

## Users & Roles

### Existing API routes (all use `requireAuth`)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/get_users` | GET | List all users (or single by `?id=`) |
| `/api/user/create` | POST | Create user (username, email, password, role) |
| `/api/user/edit` | POST | Edit user (user_id, username, email, password?, role) |
| `/api/user/delete` | POST | Soft-delete user (user_id) |
| `/api/user/get_roles` | GET | List all roles |
| `/api/user/role` | POST | Create or edit a role (action, name, permissions) |
| `/api/user/role/get_permissions` | GET | List all available permission modules + actions |

### Existing UI
`app/users-and-roles/page.tsx` — full CRUD for users and roles with permission checkboxes.

### Permission model
Permissions are stored as `{module: [action, ...]}` where actions are `c`, `r`, `u`, `d` (create, read, update, delete).

**Modules for this app:** `dashboard`, `production`, `material`, `sales`, `analysis`, `clients`, `vendors`, `users`, `roles`.

---

## RBAC — to be built

The permission data is stored and managed via the Roles UI, but **not enforced** yet. Build the following:

### Client-side enforcement
- `hooks/use-permission.ts` — `usePermission(module, action): boolean` hook that reads the current user's role, fetches that role's permissions, and returns whether the action is allowed
- Wrap protected UI elements (buttons, nav links, pages) with permission checks
- Sidebar: only show nav items the user has `r` permission for
- CRUD buttons: only show create/edit/delete if user has `c`/`u`/`d`

### Server-side enforcement
- `lib/require-permission.ts` — middleware that checks the requesting user's role permissions before allowing the API route to proceed
- Apply to all CRUD routes for clients, vendors, users, roles
- Analytics routes (read-only JSON) can require just `r` permission on the relevant module

### Route-level guards
- If a user navigates to a page they don't have `r` permission for, redirect to `/main-dashboard`
- The login page and main dashboard are always accessible

---

## Client Master — new page

### Route
`/clients` — added to sidebar

### API routes
| Route | Method | Purpose | Permission |
|-------|--------|---------|-----------|
| `/api/clients` | GET | List all clients (with search/filter) | clients:r |
| `/api/clients` | POST | Create new client | clients:c |
| `/api/clients/[id]` | GET | Get single client | clients:r |
| `/api/clients/[id]` | PUT | Update client | clients:u |
| `/api/clients/[id]` | DELETE | Soft-delete client | clients:d |

### UI pattern
Follow the same pattern as `users-and-roles/page.tsx`:
- Table with search bar and "Add Client" button
- Create/edit via Sheet (slide-in drawer)
- View detail via Sheet
- Delete with AlertDialog confirmation
- Status badge (active/inactive)

### Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | text | yes | Company name |
| contact_person | text | no | Primary contact |
| email | email | no | |
| phone | text | no | |
| address | textarea | no | Street address |
| city | text | no | |
| state | text | no | |
| status | select | yes | active / inactive |

---

## Vendor Master — new page

### Route
`/vendors` — added to sidebar

### API routes
Same pattern as clients:
| Route | Method | Purpose | Permission |
|-------|--------|---------|-----------|
| `/api/vendors` | GET | List all vendors | vendors:r |
| `/api/vendors` | POST | Create new vendor | vendors:c |
| `/api/vendors/[id]` | GET | Get single vendor | vendors:r |
| `/api/vendors/[id]` | PUT | Update vendor | vendors:u |
| `/api/vendors/[id]` | DELETE | Soft-delete vendor | vendors:d |

### UI pattern
Same as Client Master.

### Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | text | yes | Company name |
| contact_person | text | no | Primary contact |
| email | email | no | |
| phone | text | no | |
| category | text | no | e.g., Raw Materials, Packaging, Equipment |
| address | textarea | no | |
| city | text | no | |
| state | text | no | |
| status | select | yes | active / inactive |

---

## Sidebar navigation

### Updated `navItems` array
```
1. Dashboard       → /main-dashboard    (LayoutDashboard)
2. Production      → /production        (Factory)
3. Material        → /material          (Package)
4. Sales           → /sales             (TrendingUp)
5. Analysis        → /analysis          (Activity)
6. Clients         → /clients           (Users)         ← NEW
7. Vendors         → /vendors           (Truck)         ← NEW
8. Make Your Own   → /make-your-own     (LayoutDashboard)
9. Users & Roles   → /users-and-roles   (Shield)        ← NEW (link added)
```

---

## Services layer (post-cleanup)

After stripping external FastAPI services, `services/api.ts` should contain only:

- `authService` — `login()`
- `userService` — `getRoles`, `getUsers`, `createUser`, `editUser`, `deleteUser`, `manageRole`, `getPermissions`
- `clientService` — `getClients`, `getClient`, `createClient`, `updateClient`, `deleteClient` ← NEW
- `vendorService` — `getVendors`, `getVendor`, `createVendor`, `updateVendor`, `deleteVendor` ← NEW

All using `apiClient` (the renamed `internalApiClient`).

---

## Dashboard builder (Make Your Own)

### Widget catalog — update terminology
Rename all widgets to use generic manufacturing terms:
- "Cartons Produced / Month" → "Units Produced / Month"
- "Cartons Delivered / Month" → "Units Delivered / Month"
- "Production vs Delivery" → keep as-is
- "Sales by Executive" → "Sales by Rep"
- "Production by Model" → "Production by Product Line"
- "Top Blanks by Usage" → "Top Components by Usage"
- "Raw Material by Vendor" → keep as-is
- "Deliveries by Dealer" → "Deliveries by Distributor"

### KPI catalog — update terminology
- "Total Cartons Produced" → "Total Units Produced"
- "Total Cartons Delivered" → "Total Units Delivered"
- "Production vs Delivery Gap" → keep as-is
- "Models in Production" → "Product Lines Active"

### Data source
Widget and KPI API routes (`/api/myo/widget`, `/api/myo/kpi`) read from `data/myo/` JSON files.

---

## Charting

### Library
**Highcharts** + `highcharts-react-official` — primary charting library. Keep all existing chart configurations.

### BASE_THEME pattern
All pages and widgets use a shared Highcharts base theme:
- Transparent background
- Styled labels (`#9CA3AF`, 11-12px)
- Custom tooltip (dark popover bg, 8px borderRadius)
- Grid lines disabled
- Formatter: values >= 1000 display as "Xk"

### Chart types used
- `spline` / `areaspline` — trends
- `column` — bar charts (vertical)
- `bar` — horizontal bar charts
- `pie` (innerSize 50-70%) — donut charts
- Custom CSS lollipop charts — production page

### Colors
Primary palette: `#60A5FA` (blue), `#34D399` (emerald), `#A78BFA` (violet), `#FBBF24` (amber), `#F87171` (red)

---

## Key file locations

| Task | File |
|------|------|
| Add an analytics endpoint | New file: `app/api/<route>/route.ts` reading from `data/<file>.json` |
| Add a DB-backed endpoint | New file: `app/api/<route>/route.ts` using `pool` from `lib/db` |
| Add a service call | `services/api.ts` using `apiClient` |
| Add a data-fetching hook | `hooks/use-<feature>.ts` |
| Add a sidebar link | `navItems` array in `components/Sidebar.tsx` |
| Add a new page | `app/<slug>/page.tsx` |
| Shared types | `shared/api.ts` |
| Auth utilities | `lib/jwt.ts`, `lib/auth.ts`, `lib/auth-server.ts` |
| DB pool | `lib/db.ts` |
| Static data | `data/<category>/<file>.json` |
| Seed data | `data/seed/<table>.json` |

---

## Development

```bash
npm run dev      # start dev server at http://localhost:3000
npx tsc --noEmit # type-check without building
npm run build    # production build
```

---

## What Claude should NOT do

- Do not create a new `Pool` or `Client` outside `lib/db.ts`
- Do not put DB queries in Client Components or hooks
- Do not expose `DATABASE_URL`, `JWT_SECRET`, or any DB credentials to the client
- Do not prefix server-only env vars with `NEXT_PUBLIC_`
- Do not re-introduce external FastAPI calls or `apiClient` with a base URL
- Do not hardcode user credentials or bypass `requireAuth()`
- Do not add features, abstractions, or refactors beyond what is explicitly requested
- Do not add comments or docstrings to code that is not being changed
- Do not skip `requireAuth()` on protected API routes
- Do not store passwords in plain text — always use bcrypt hashing
