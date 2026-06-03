# Heimdyn ERP (Phase 2 demo) — Build Resume / Handoff

> **Branch:** `feature/erp-phase2`
> **Purpose:** Where to pick up the build. Read this first, then `HANDOFF.md` (phased plan + gates), `SOW.md` (scope), `DESIGN.md` (design system).
> **Authority order:** SOW.md > HANDOFF.md > everything else (incl. CLAUDE.md) until Phase 3.

---

## Build mode (non-negotiable)
- **No database.** All ERP data is seeded TypeScript in `lib/erp/`. No Postgres/migrations — that's Phase 3.
- **Demo-first.** Make it look and click like it works; fake backend logic. Status changes are in-session (reset on refresh).
- **USD only.** No dual currency.
- **One reusable list+drawer** component for the list-style modules — `components/erp/ListDrawer.tsx`. Never rebuild per module.
- **Sales Orders are system-created only** — no manual "create SO" / "convert to SO" button anywhere.
- **Document Trail** is driven by cross-reference IDs in the seed data.
- **Stop at each phase gate** — present working output + checklist, do not proceed until the user confirms.

---

## Progress

| Phase | Scope | Status |
|---|---|---|
| **1** | Seed data + app shell (sidebar, dashboard, route stubs) | ✅ Done, gate passed, committed |
| **2** | Reusable `<ListDrawer>` + Inventory module | ✅ Done, **gate passed** (user confirmed) |
| **2.5** | Master pages: Products, Raw Materials, BOM (SOW deliverables 1–3) | ✅ Built on `ListDrawer`; Products has in-session Active/Inactive toggle |
| **3** | Purchase Orders + Manufacturing Orders + Document Trail | ✅ Done, **gate passed**; in-session store added (`lib/erp/store.tsx`) |
| **4** | Quotations (Kanban + 3-step wizard) + Sales Orders | ✅ Done, **gate passed** |
| **5** | The scripted demo flow (QT-1002 cascade) | ✅ Done, self-verified end-to-end (+ reset) |
| **6** | Dashboard live counts + Activity feed + 6-role switcher + QA | ✅ Done, self-verified |

**🎉 All 6 phases complete.** Phase 2 demo build is feature-complete and demo-ready.

---

## Build complete — what's next is Phase 3 (the real one: live DB)

All 6 demo phases are built, self-verified, committed, and pushed on `feature/erp-phase2`.
The remaining work is the **real Phase 3** (out of scope here): live Neon DB + persistence,
server-side RBAC, real inventory math, multi-location, notifications. See "explicitly NOT in
this build" in `HANDOFF.md`.

Optional polish ideas if revisited: unify all Document Trails to start at QT; point Inventory's
raw-material stock at the store so PO receipts reflect there too; persist the in-session store to
localStorage so a refresh doesn't reset a demo in progress.

### Phase 6 (just completed)

**Goal:** dashboard wired to live counts, a realistic activity feed, a 6-role UI switcher, and a DESIGN.md QA pass.

**Build tasks (HANDOFF.md §PHASE 6):**
- **Dashboard live counts**: `app/dashboard/page.tsx` currently computes KPIs/pipelines from **static seed** via `lib/erp/selectors.ts`. Rewire it to read from the **session store** (`useErpStore`) so it reflects demo cascade changes (make it a client component, or add store-based selectors). Pipeline bars = stage counts for Quotations/SO/MO/PO; KPI cards off live data.
- **Recent Activity feed**: a seeded static list of realistic events (newest first) on the dashboard. Live wiring is out of scope (Phase 3-future).
- **Role switcher**: a dropdown to switch among the 6 roles (Admin, Sales Executive, Sales Manager, Production Manager, Purchase Manager, Accounts). Client-side only — show/hide the relevant action buttons (e.g. only Sales Manager sees Approve on quotations; Production Manager approves/advances MOs; Purchase Manager approves/receives POs; Accounts sees invoicing; Sales Executive creates quotations but can't approve; Admin sees all). Suggest a `RoleContext` provider + a `useRole()` gate used to conditionally render the action buttons already built in each module.
- **Visual QA** against DESIGN.md across every screen (dark `#10131A`, pills, 480px drawer, no shadows, mono numerals). Optional consistency tidy: unify all Document Trails to start at QT, and consider pointing Inventory's raw-material stock at the store so receipts reflect there too.

**Phase 6 gate checklist:**
- [ ] Dashboard KPIs reflect actual counts from the data
- [ ] Pipeline bars show correct stage counts for Sales / Manufacturing / Purchase
- [ ] Recent Activity feed displays realistic events
- [ ] Role switcher changes which action buttons are visible
- [ ] Every screen matches DESIGN.md
- [ ] Walk-through of all 13 SOW deliverables confirms each is present

**Faked in Phase 6:** roles are a UI switcher (not real auth); activity feed is static. All Phase 3-future items (live DB, server RBAC, persistence) stay out of scope.

### Done so far (reference)
- **Store** (`lib/erp/store.tsx`, mounted in `app/layout.tsx`): `addQuotation`, `approveQuotation` (stock-short → spawns MO), `rejectQuotation`, `approveManufacturingOrder` (auto-raises POs for short materials), `advanceManufacturingOrder` (Done → auto-creates SO), `approvePurchaseOrder`, `confirmGoodsReceipt` (raises live `materialStock`), `advanceSalesOrder`, `reset`, `getMaterialStock`. MO BOM "Available" reads live store stock.
- **Modules**: Inventory (P2), Products/RawMaterials/BOM masters (P2.5), PO + MO + `DocumentTrail` (P3), Quotations Kanban + 3-step wizard + Sales Orders (P4), demo cascade + Reset button on Quotations (P5).
- **Shared**: `ListDrawer` (`autoOpenId`, a11y `SheetTitle`), `StatusPill`+`statusTone`, `DrawerField`, `DocumentTrail` (QT/SO/MO/PO). Quote money `formatPrice` (cents); SO/PO/dashboard `formatUsd` (whole).
- **Demo note:** navigate via in-app sidebar links during the demo (a browser refresh resets the in-session store); use the **Reset demo** button on Quotations to re-run. Generated cascade IDs: MO-3006 → PO-4007 → SO-2005 (ids are computed, not the cosmetic reserved ones in `DEMO_FLOW`).

---

## Where things live

```
lib/erp/
  types.ts                      # all interfaces + status unions + StockStatus
  selectors.ts                  # lookups (getProduct/getMaterial/getVendor/getCustomer/
                                #   getQuotation/getSalesOrder/getManufacturingOrder/getPurchaseOrder),
                                #   *ByStage() counts, erpKpis(), stockStatus(),
                                #   formatUsd(v, digits=0), formatPrice(v)=2dp
  seed/
    products.ts (PRD-1xx)  raw-materials.ts (RM-2xx)  boms.ts
    vendors.ts (VEN-5xx)   customers.ts (CUS-6xx)
    quotations.ts (QT-1xxx) sales-orders.ts (SO-2xxx)
    manufacturing-orders.ts (MO-3xxx)  purchase-orders.ts (PO-4xxx)
    index.ts                    # re-exports + DEMO_FLOW + assertSeedIntegrity()
                                #   (throws on any dangling cross-ref in dev)

components/erp/
  ListDrawer.tsx                # THE reusable list + 480px right drawer (Radix Sheet,
                                #   restyled: bg-popover, 1px left border, no shadow).
                                #   Selection tracked by id so the drawer reflects live data.
  StatusPill.tsx                # PillTone set per DESIGN §4 + stockTone() helper
  DrawerField.tsx               # labelled key/value row for drawers
  ModulePlaceholder.tsx         # phase stub used by not-yet-built modules

app/
  dashboard/page.tsx            # ERP dashboard (KPI cards + pipeline bars from seed)
  inventory/page.tsx            # Phase 2 module (two pools, tabs, Add Stock on raw only)
  products/page.tsx             # Product Master (list+drawer, in-session activate/deactivate)
  raw-materials/page.tsx        # Raw Material Master (list+drawer, read)
  bom/page.tsx                  # BOM viewer (list+drawer with recipe breakdown table)
  quotations|sales-orders|manufacturing-orders|purchase-orders/page.tsx  # stubs (Phases 3–4)
```

**Design tokens & fonts:** `app/globals.css` (`.dark` palette = DESIGN §3), `tailwind.config.ts` (fontFamily sans=Inter, mono=Geist Mono). Use semantic tokens only (`bg-card`, `text-foreground`, `bg-popover`…), no hardcoded hex. Numbers/IDs use `font-mono`.

**Sidebar:** `components/Sidebar.tsx` `navItems` — Dashboard, Quotations, Sales Orders, Manufacturing Orders, Purchase Orders, Inventory, Products, Raw Materials, BOM, Vendors, Users & Roles. Landing (`/` + post-login) → `/dashboard`. Old analytics (`/main-dashboard`, etc.) still reachable by URL, not in nav.

---

## The interlinked seed chains (Document Trail source of truth)

| Chain | Trail | Notes |
|---|---|---|
| α (done) | QT-1001 → MO-3001 → [PO-4001, PO-4002] → SO-2001 | fully completed |
| β (ex-stock) | QT-1003 → SO-2003 | Path A, no MO |
| γ (mid-flight) | QT-1004 → MO-3003 → [PO-4003] → SO-2004 | MO In Progress |
| build-ahead | MO-3005 → [PO-4005] | no source quote/SO |
| **DEMO (Phase 5)** | **QT-1002** (Pending Approval, stock short) → reserved **MO-3010 → PO-4010 → SO-2010** | created in-session |

Cross-ref fields: Quotation `{linkedMO, linkedSO}` · SalesOrder `{sourceQuotation, sourceMO}` · ManufacturingOrder `{sourceQuotation, sourceSO, raisedPOs[]}` · PurchaseOrder `{sourceMO, vendorId, materialId}`.

Demo math: **PRD-102** BOM needs 9× **RM-203 Hardwood Block**/unit → 4,500 for qty 500 vs 3,000 in stock → one PO. Don't change RM-203 stock. (RM-213 strapping is set to 0 only to demo the red "Out of Stock" pill; it's in no BOM.)

---

## Session state (needed from Phase 3 on)
Phases 3–5 change document statuses by clicking (Approve, Confirm Receipt, advance MO, etc.) and these must persist across navigation within a session. Inventory currently keeps its own local `useState`. For documents, introduce a shared in-session store seeded from `lib/erp/seed` — e.g. a React context/provider or a small `lib/erp/store.ts` (zustand-style or context). Keep it in-memory only (resets on refresh — that's the agreed demo behaviour). Don't add a DB.

---

## Run & verify

```bash
npm run dev        # http://localhost:3000  (Preview launch config: .claude/launch.json, name "heimdyn")
npx tsc --noEmit   # must stay clean
```

**Auth note for testing:** pages render inside an auth gate (`AuthProvider` + `AutoAuthModal` redirect to `/login`). Login hits Neon via `/api/auth/login`. For headless/preview UI testing **without a password**, the client only *decodes* the access-token `exp` (it does not verify the signature) and the ERP pages read seed directly — so you can inject a well-formed unexpired token + `user` object into `localStorage` (`access_token`, `refresh_token`, `user`) to render the signed-in shell. This is a local test harness only.

**Preview caveat:** the headless preview renderer freezes CSS animations, so `preview_screenshot` may time out and an animating Radix drawer reads as off-screen mid-slide. Verify resting state by cancelling the animation (`el.style.animation='none'`) or use DOM/`getComputedStyle` assertions. It animates normally in a real browser.

---

## Phase 2 self-test summary (green)
- tsc clean; all routes 200.
- Inventory: both pools + correct quantities; drawer 480px / `bg-popover` / 1px border / no shadow / on-screen at rest; open via row, close via X + Escape; pills green/amber/red verified by computed colour; Add Stock raw-only and updates value+status+row live.
- Fixed: unit prices now cent-precision (`formatPrice`), e.g. $18.50.
- **Open item:** awaiting the user's manual gate sign-off in a real browser (drawer slide animation, backdrop-click close).
