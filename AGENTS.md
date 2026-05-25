# AGENTS.md — Factory SaaS Codebase Guide for AI Agents

This file provides the conventions, structure, and patterns that AI coding agents
(GitHub Copilot, Cursor, Windsurf, etc.) should follow when working in this repo.

---

## Project Overview

**Stack:** Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS · TanStack Query  
**Purpose:** Factory management SaaS dashboard (OEE, machines, tickets, power, inventory)  
**Database:** Neon PostgreSQL (serverless, connection-pooled) via `pg` (node-postgres)  
**Backend API:** External REST API at `http://127.0.0.1:8000` (FastAPI, not part of this repo)

---

## Directory Structure

```
app/                   Next.js App Router pages and API routes
  api/
    db-test/route.ts   GET /api/db-test — runs SELECT 1, returns { success, message }
  db-connection/       /db-connection page — displays DB metadata + live status
  machines/            /machines page
  inventory/           /inventory page
  tickets/             /tickets page
  power-consumption/   /power-consumption page
  downtime-analysis/   /downtime-analysis page
  users-and-roles/     /users-and-roles page
components/            Shared UI components
  AuthProvider.tsx     Auth context — currently in DUMMY mode (any creds work)
  Sidebar.tsx          Navigation — navItems[] array drives all sidebar links
  features/            Feature-specific components (availability, inventory, machines…)
  ui/                  shadcn/ui primitives
hooks/                 TanStack Query hooks (use-*.ts)
lib/
  db.ts                Singleton pg Pool — import this for all DB access
  utils.ts             cn() utility only
services/
  api.ts               All REST service calls (factoryService, ticketsService, etc.)
  config.ts            apiClient (fetch wrapper) + API_BASE_URL
  availabilityService.ts  Availability-specific service
shared/
  api.ts               TypeScript interfaces shared between client and server
```

---

## Database Connection

### Location
`lib/db.ts` — the **only** file that should instantiate a database connection.

### How to use in a route handler

```ts
// app/api/some-route/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM my_table LIMIT 10');
    return NextResponse.json({ rows: result.rows });
  } finally {
    client.release(); // always release
  }
}
```

### Rules
- **Never** import `pg` directly in pages or components — always import `pool` from `@/lib/db`.
- **Never** run DB queries in Client Components (`'use client'`). Use API routes.
- **Always** call `client.release()` in a `finally` block.
- SSL is pre-configured (`rejectUnauthorized: false`). Do not override.
- `DATABASE_URL` is read from `.env.local` — never hardcode the connection string.

### Connection details (non-secret)
| Field    | Value |
|----------|-------|
| Host     | `ep-crimson-band-a15hypbr-pooler.ap-southeast-1.aws.neon.tech` |
| Database | `neondb` |
| User     | `neondb_owner` |
| Port     | `5432` |
| SSL      | Required |
| Pooling  | Enabled (Neon pooler endpoint) |

---

## REST API Client

### Location
`services/config.ts` exports `apiClient` and `API_BASE_URL`.

### Base URL
Configured via env var: `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://127.0.0.1:8000`).

### Methods

```ts
import { apiClient } from '@/services/config';

// GET
const data = await apiClient.get<MyType>('/endpoint');

// GET with auth (Bearer token from localStorage)
const data = await apiClient.get<MyType>('/endpoint', true);

// POST
const data = await apiClient.post<MyType>('/endpoint', payload);

// POST with auth
const data = await apiClient.post<MyType>('/endpoint', payload, true);
```

### Available services (`services/api.ts`)

| Service | Method | Endpoint |
|---------|--------|----------|
| `factoryService.getOverview()` | GET | `/oee` |
| `sensorsService.getSensorData()` | GET | `/sensor_data` |
| `machinesService.getMachineStatus()` | GET | `/machines/status-history` |
| `machinesService.getMaintenanceSchedule()` | GET | `/machines/maintenance` |
| `mceService.getMCE()` | GET | `/mce` |
| `oeeService.getOEE()` | GET | `/oee` |
| `operatorEfficiencyService.getOperatorEfficiency()` | GET | `/operator_efficiency` |
| `machinePerformanceService.getMachinePerformance()` | GET | `/performance` |
| `productionYieldService.getProductionYield()` | GET | `/yield` |
| `machineDowntimeService.getMachineDowntime()` | GET | `/machine_downtime` |
| `downtimeReportService.createDowntimeReport(data)` | POST | `/downtime-reports` |
| `downtimeReportService.getDowntimeLists()` | GET | `/downtime_report_list` |
| `downtimeLogService.insert(payload)` | POST | `/downtime_log_insert` |
| `ticketsService.getTickets()` | GET | `/tickets` |
| `ticketsService.getTicketsAnalytics()` | GET | `/tickets/analytics` |
| `ticketsService.createTicket(data)` | POST | `/tickets/insert` |
| `ticketsService.updateStatus(data)` | POST | `/tickets/update_status` |
| `operatorsService.getOperators()` | GET | `/operators_list` |
| `machineListService.getMachines()` | GET | `/machines_list` |
| `newsService.getNews()` | GET | `/news` |
| `powerConsumptionService.getPowerAnalytics(period)` | GET | `/power_consumption/analytics?period=` |
| `powerConsumptionService.getPowerConsumption(period)` | GET | `/power_consumption?period=` |
| `powerConsumptionService.getPowerTimeSeries(period)` | GET | `/power_consumption/time_series?period=` |
| `availabilityService.getAvailability()` | GET | `/availability` |

---

## Adding a New Page

1. Create `app/<route>/page.tsx`
2. Add an entry to the `navItems` array in `components/Sidebar.tsx`:
   ```ts
   import { IconName } from 'lucide-react';
   // inside navItems array:
   { href: '/your-route', label: 'Display Name', icon: IconName }
   ```

---

## Adding a New API Route (Next.js)

Create `app/api/<name>/route.ts`. Use the DB pool for database operations:

```ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT ...', []);
    return NextResponse.json(rows);
  } finally {
    client.release();
  }
}
```

---

## Adding a New TanStack Query Hook

Follow the pattern in `hooks/use-tickets.ts`:

```ts
// hooks/use-my-feature.ts
import { useQuery } from '@tanstack/react-query';
import { myService } from '@/services/api';

export function useMyFeature() {
  return useQuery({
    queryKey: ['my-feature'],
    queryFn: () => myService.getData(),
  });
}
```

---

## Auth (Currently in Dummy Mode)

`components/AuthProvider.tsx` is the sole auth context. It is **currently bypassed**:
- `signIn()` accepts **any** credentials and logs in as `Demo User (admin)`.
- The modal still appears — submit any form values to proceed.
- `isSignedIn`, `user`, `signIn`, `signOut` are available via `useAuth()`.
- To restore real auth: replace the `signIn` body with the commented-out API call.

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string — in `.env.local` |
| `NEXT_PUBLIC_API_BASE_URL` | No | Defaults to `http://127.0.0.1:8000` |

**Never** prefix `DATABASE_URL` with `NEXT_PUBLIC_` — it must stay server-side only.

---

## Key Rules for Agents

1. Add new DB queries only in `app/api/` route handlers — never in Client Components.
2. Always use `@/lib/db` for DB access. Never instantiate a new `Pool` elsewhere.
3. All shared TypeScript types live in `shared/api.ts`.
4. Sidebar items live in the `navItems` array in `components/Sidebar.tsx`.
5. For data fetching in components, write a TanStack Query hook in `hooks/`.
6. Do not add UI polish, extra error handling, or abstractions beyond what is asked.
7. Run `npx tsc --noEmit` to verify types before committing.
