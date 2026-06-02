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
| **2** | Reusable `<ListDrawer>` + Inventory module | ✅ Built, self-tested green; **awaiting user gate sign-off** |
| **3** | Purchase Orders + Manufacturing Orders + Document Trail | ⏭️ **NEXT** |
| 4 | Quotations (Kanban + 3-step wizard) + Sales Orders | ⬜ |
| 5 | The scripted demo flow (QT-1002 cascade) | ⬜ |
| 6 | Dashboard live counts + Activity feed + 6-role switcher + QA | ⬜ |

---

## RESUME HERE → Phase 3

**Goal:** the two reactive modules + the Document Trail component. Build both on the existing `<ListDrawer>`.

**Build tasks (from HANDOFF.md §PHASE 3):**
- **Purchase Orders** (`app/purchase-orders/page.tsx`): list + drawer; summary bar (open orders, total pending value); status flow Pending Approval → Approved → Goods Received; **Approve** button; **Goods Receipt** section with received-qty input + **Confirm Receipt** button (status → Goods Received, in-session).
- **Manufacturing Orders** (`app/manufacturing-orders/page.tsx`): list + drawer; status flow Pending Approval → Planned → In Progress → Done; **BOM breakdown table** (Material / Required / Available / Status) with **"PO Raised"** badge on insufficient rows; progress indicator (completedQty / quantity).
- **Document Trail** component (new, `components/erp/DocumentTrail.tsx`): horizontal chain of clickable pill-boxes **SO → MO → PO**, current node highlighted (`border-primary ring-1 ring-primary/20`), others `bg-card border-border`. Render it in both the MO and PO drawers. Built from seed cross-reference IDs. Clicking a node navigates to that document.

**Phase 3 gate checklist (what the user verifies):**
- [ ] PO list shows all seeded POs with correct status pills
- [ ] PO drawer shows vendor, material, quantity, value, Goods Receipt section
- [ ] Confirm Receipt visibly changes PO status to Goods Received
- [ ] MO list shows all seeded MOs with correct 4-stage status pills
- [ ] MO drawer shows BOM breakdown with Sufficient/Insufficient statuses
- [ ] "PO Raised" badge appears on insufficient BOM rows
- [ ] Document Trail (SO → MO → PO) renders in MO and PO drawers with correct linked IDs
- [ ] Clicking a linked ID in the trail navigates to that document

**Faked in Phase 3:** Approve / Confirm Receipt change status in-session only; no real inventory math.

**Reuse, don't rebuild:** `ListDrawer`, `StatusPill` (+ map MO/PO statuses to tones — see DESIGN §4), `DrawerField`, `formatUsd`, `selectors.get*` lookups. For the in-session status changes you'll likely lift the data into a shared session store (see "Session state" below).

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
  quotations|sales-orders|manufacturing-orders|purchase-orders|products|
    raw-materials|bom/page.tsx  # stubs (replace as phases land)
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
