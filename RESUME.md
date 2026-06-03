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
| **4** | Quotations (Kanban + 3-step wizard) + Sales Orders | ⏭️ **NEXT** |
| 5 | The scripted demo flow (QT-1002 cascade) | ⬜ |
| 6 | Dashboard live counts + Activity feed + 6-role switcher + QA | ⬜ |

---

## RESUME HERE → Phase 4

**Goal:** the sales front end — Quotations (Kanban board + 3-step creation wizard) and Sales Orders. Heaviest UI; patterns are now proven.

**Build tasks (from HANDOFF.md §PHASE 4):**
- **Quotations** (`app/quotations/page.tsx`): **Kanban board**, four columns Draft → Pending Approval → Proforma Invoice → Sales Order Raised. Cards show customer, product, quantity, value; red **"Requires MO"** badge where `stockShort` is true. Card → drawer with line items + **Approve / Reject** (NO "Convert to SO" button). Plus a **3-step creation wizard** (Customer details → Line items → Review & Submit). **USD only, NO discount column.** Product dropdown shows **finished goods only** (active products; no raw materials/services).
- **Sales Orders** (`app/sales-orders/page.tsx`): list + drawer (reuse `ListDrawer`), status flow Confirmed → Stock Committed → Dispatched → Invoiced. **NO manual create button** — SOs appear only from seed or the demo flow.

**Phase 4 gate checklist (what the user verifies):**
- [ ] Quotations Kanban shows four correctly-labelled columns with seeded cards
- [ ] "Requires MO" badge appears on the right cards (QT-1002, QT-1004, QT-1007 are stockShort)
- [ ] New Quotation wizard opens, all 3 steps work, line items calculate totals
- [ ] Product dropdown shows ONLY finished goods (no raw materials, no services)
- [ ] No discount column anywhere; all amounts in USD
- [ ] Quotation drawer shows Approve/Reject (no "Convert to SO" button)
- [ ] Sales Orders list shows seeded SOs with correct status pills
- [ ] There is NO manual "create Sales Order" button anywhere

**Faked in Phase 4:** the wizard creates a quotation in-session (add it to the store — extend `lib/erp/store.tsx` with an `addQuotation`/quotation status actions). Stock check is a green/amber indicator from seed, not live math.

**Reuse, don't rebuild:** `ListDrawer` (Sales Orders), `StatusPill` + `statusTone`, `DrawerField`, `DocumentTrail` (QT → SO, and SO → MO → PO on Sales Orders), `formatUsd`/`formatPrice`, `useErpStore`. The Kanban board is the one bespoke layout (not `ListDrawer`) — build columns of cards, card click opens the same Sheet-style drawer.

### Done in Phase 3 (reference)
PO + MO modules + `DocumentTrail` + in-session `ErpStoreProvider` (mounted in `app/layout.tsx`). Store actions so far: `approvePurchaseOrder`, `confirmGoodsReceipt`, `approveManufacturingOrder`, `advanceManufacturingOrder`. `ListDrawer` gained `autoOpenId` (deep-link via `?focus=`) and a proper `SheetTitle`/`SheetDescription` (a11y). Seed reconciled so each MO's `raisedPOs` match its short materials (PO-4001/4003/4005/4006).

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
