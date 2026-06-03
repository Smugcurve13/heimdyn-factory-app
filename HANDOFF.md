# Heimdyn ERP — Phase 2 Build Handoff

> **Status:** Active build document
> **Scope authority:** This document + `SOW.pdf` (in repo root) are the single source of truth for every decision until Phase 3 (live DB connection). If anything here conflicts with a verbal instruction, this document wins. If anything here conflicts with the SOW, the SOW wins.
> **Build window:** 2 days, demo-ready target
> **Build mode:** Demo-first. Seeded data, no live database. Persistence and real backend logic are Phase 3.

---

## 0. Ground Rules (read once, applies to every phase)

These rules are non-negotiable for the whole build. They exist so the output stays consistent and testable.

1. **No real database.** All data lives in seeded TypeScript files (or a single JSON source). Do NOT set up Postgres, migrations, or DB connections. That is Phase 3.
2. **Demo-first, not production.** The goal is a system that *looks and clicks* like it fully works for a live demo. We fake backend logic wherever real logic would cost time. Status labels can be cosmetic.
3. **One reusable list + drawer component.** Four of five modules use the same pattern. Build it once, parameterised. Never rebuild per module.
4. **The design system is fixed.** Follow `DESIGN.md` exactly — dark theme (`#10131A` background, `#1D2027` cards, `#ADC6FF` primary), Inter + Geist fonts, 480px right-side drawer, pill-shaped status tags. No new colours, no new fonts.
5. **Document Trail everywhere.** Every detail drawer shows the linked-document chain (e.g. SO → MO → PO). This works because seed data carries cross-reference IDs.
6. **USD only.** No dual currency. All pricing and totals in USD.
7. **Sales Orders are system-created only.** There is NO manual "create SO" or "convert to SO" button anywhere in the UI.
8. **Stop at each phase gate.** After each phase, present working output for testing. Do NOT proceed to the next phase until the gate checklist passes. This keeps the user in control.

---

## How to use this document

The build is split into **6 phases**. Each phase has:

- **Goal** — what gets built
- **Build tasks** — what Claude does
- **Test checklist** — what YOU click through and verify before moving on (the phase gate)
- **What's intentionally faked** — so you know what is and isn't real yet

Do not move to the next phase until every box in the test checklist passes. If something fails, report exactly which checklist item failed and Claude fixes it before continuing.

---

## PHASE 1 — Seed Data + App Shell

**Goal:** A running app with the sidebar, dashboard shell, and a complete set of interlinked dummy data driving everything downstream.

**Build tasks:**
- Create the seed data file(s): products (~10 pallets), raw materials (~15 items), BOMs linking them, and a pre-built set of interlinked quotations, sales orders, manufacturing orders, and purchase orders that reference each other by ID.
- Confirm the sidebar navigation matches the SOW module list: Dashboard, Quotations, Sales Orders, Manufacturing Orders, Purchase Orders, Inventory, Products, Raw Materials, BOM, Users & Roles.
- Dashboard shell renders (KPI cards + pipeline bars can show placeholder/computed numbers from seed data).

**Test checklist (Phase 1 gate):**
- [ ] App runs locally with no console errors
- [ ] Sidebar shows all modules in the correct order
- [ ] Clicking each sidebar item routes to a page (even if the page is a stub)
- [ ] Dashboard loads and shows KPI cards with numbers pulled from seed data
- [ ] Seed data file exists and contains products, raw materials, BOMs, and at least 3 interlinked document sets (a quotation that links to an SO/MO, an MO that links to a PO)

**What's intentionally faked:** Everything is static seed data. Nothing persists on refresh beyond what's in the seed file.

---

## PHASE 2 — Reusable List + Drawer + Inventory

**Goal:** The core UI pattern built once, proven on the simplest module.

**Build tasks:**
- Build the reusable `<ListDrawer>` component: a filterable table on the left, a 480px detail drawer sliding in from the right when a row is clicked. Parameterised by columns and drawer content.
- Build the **Inventory** module using it: two stock pools (Finished Goods, Raw Materials), status pills (In Stock / Low Stock / Out of Stock), and a manual "Add Stock" button on raw materials only.

**Test checklist (Phase 2 gate):**
- [ ] Inventory page shows both stock pools with correct seed quantities
- [ ] Clicking any row opens the right-side drawer (480px, slides in, fully visible — not cut off)
- [ ] Closing the drawer works (X button and/or backdrop click)
- [ ] Status pills show correct colours (green / amber / red)
- [ ] "Add Stock" appears ONLY on raw materials, not finished goods
- [ ] The drawer component visually matches DESIGN.md (dark, bordered, no shadows)

**What's intentionally faked:** "Add Stock" updates the in-memory value for the session only; it resets on refresh.

---

## PHASE 3 — Purchase Orders + Manufacturing Orders

**Goal:** The two reactive modules, plus the Document Trail component.

**Build tasks:**
- **Purchase Orders:** list + drawer, summary bar (open orders, total pending value), status flow (Pending Approval → Approved → Goods Received), Approve button, Goods Receipt section with received-quantity input and Confirm Receipt button.
- **Manufacturing Orders:** list + drawer, status flow (Pending Approval → Planned → In Progress → Done), BOM breakdown table (Material / Required / Available / Status, with "PO Raised" badge on insufficient rows), and a progress indicator.
- **Document Trail component:** the SO → MO → PO chain, shown in both the MO and PO drawers, built from seed-data cross-reference IDs.

**Test checklist (Phase 3 gate):**
- [ ] PO list shows all seeded POs with correct status pills
- [ ] PO drawer shows vendor, material, quantity, value, and a Goods Receipt section
- [ ] Clicking Confirm Receipt visibly changes the PO status to Goods Received
- [ ] MO list shows all seeded MOs with correct 4-stage status pills
- [ ] MO drawer shows the BOM breakdown table with Sufficient/Insufficient statuses
- [ ] "PO Raised" badge appears on insufficient BOM rows
- [ ] Document Trail (SO → MO → PO) renders in the MO drawer and the PO drawer, with correct linked IDs
- [ ] Clicking a linked document ID in the trail navigates to that document

**What's intentionally faked:** Approve / Confirm Receipt change the status in-session only. No real inventory math fires yet.

---

## PHASE 4 — Quotations + Sales Orders

**Goal:** The sales front end. The heaviest UI, built last now that the patterns are proven.

**Build tasks:**
- **Quotations:** Kanban board with four columns (Draft → Pending Approval → Proforma Invoice → Sales Order Raised). Cards show customer, product, quantity, value. "Requires MO" red badge on cards where stock is short. Drawer shows line items + Approve/Reject. Plus the 3-step creation wizard (Customer details → Line items → Review & Submit). USD only. NO discount column. Product dropdown shows finished goods only.
- **Sales Orders:** list + drawer, status flow (Confirmed → Stock Committed → Dispatched → Invoiced). NO manual create button — SOs only appear as a result of the demo flow or seed data.

**Test checklist (Phase 4 gate):**
- [ ] Quotations Kanban shows four correctly-labelled columns with seeded cards
- [ ] "Requires MO" badge appears on the right cards
- [ ] New Quotation wizard opens, all 3 steps work, line items calculate totals
- [ ] Product dropdown shows ONLY finished goods (no raw materials, no services)
- [ ] No discount column anywhere; all amounts in USD
- [ ] Quotation drawer shows Approve/Reject (no "Convert to SO" button)
- [ ] Sales Orders list shows seeded SOs with correct status pills
- [ ] There is NO manual "create Sales Order" button anywhere

**What's intentionally faked:** The wizard creates a quotation in-session. Real-time stock check shows a green/amber indicator based on seed data, not live math.

---

## PHASE 5 — The Demo Flow (the money phase)

**Goal:** ONE happy-path chain that actually works end to end, smoothly, for the live demo. This is what sells it.

**Build tasks:**
Wire a single scripted flow so these actions cascade visibly:
1. Approve a specific quotation (one where stock is short)
2. → a Manufacturing Order appears in Pending Approval
3. Approve the MO → it moves to Planned, and a Purchase Order appears
4. Approve the PO → Confirm Goods Receipt → raw material shows as received
5. Move the MO: Planned → In Progress → Done
6. → a Sales Order appears in Confirmed status
7. Move SO to Dispatched → Invoiced

This one path must be flawless. It does NOT need to handle other quotations or edge cases — just this scripted demo story.

**Test checklist (Phase 5 gate):**
- [ ] Approving the demo quotation makes an MO appear
- [ ] Approving the MO makes a PO appear
- [ ] Confirming PO receipt updates the linked MO's BOM row to Sufficient
- [ ] Completing the MO makes a Sales Order appear automatically
- [ ] The whole chain can be clicked through start to finish with no dead ends
- [ ] The Document Trail correctly links every document created in the chain
- [ ] You can run the full demo twice in a row (reset between runs is acceptable)

**What's intentionally faked:** Only this one quotation triggers the full cascade. Other quotations can show static behaviour.

---

## PHASE 6 — Dashboard, Roles & Polish

**Goal:** Final glue and presentation layer.

**Build tasks:**
- Dashboard KPI cards + pipeline bars wired to live counts off the seed/session data.
- Recent Activity feed: seeded static feed that looks realistic (live wiring is Phase 3).
- Role switcher: a simple dropdown to switch between the 6 roles (Admin, Sales Executive, Sales Manager, Production Manager, Purchase Manager, Accounts), showing/hiding the relevant action buttons. Client-side only.
- Visual QA pass against DESIGN.md across every screen.

**Test checklist (Phase 6 gate):**
- [ ] Dashboard KPIs reflect actual counts from the data
- [ ] Pipeline bars show correct stage counts for Sales / Manufacturing / Purchase
- [ ] Recent Activity feed displays realistic events
- [ ] Role switcher changes which action buttons are visible (e.g. only Sales Manager sees Approve on quotations)
- [ ] Every screen matches DESIGN.md — dark theme, correct pills, 480px drawer, no stray light-mode elements
- [ ] Full walk-through of all 13 SOW deliverables confirms each is visibly present

**What's intentionally faked:** Roles are a UI switcher, not real auth. Activity feed is static. All Phase 3 items (live DB, server-side RBAC, persistence) remain out of scope.

---

## Deliverables Coverage Map (against SOW Section 7)

| # | SOW Deliverable | Built in Phase |
|---|-----------------|----------------|
| 1 | Product Master | 1 (view) |
| 2 | Raw Material Master | 1 (view) |
| 3 | BOM editor | 1 (view) |
| 4 | Quotations module | 4 |
| 5 | Sales Orders module | 4 + 5 |
| 6 | Manufacturing Orders | 3 |
| 7 | Purchase Orders | 3 |
| 8 | Inventory | 2 |
| 9 | Dashboard | 6 |
| 10 | Role-based access (UI) | 6 |
| 11 | Document Trail | 3 |
| 12 | USD currency support | 4 |
| 13 | Sample data seeded | 1 |

---

## Phase 3 (future) — explicitly NOT in this build

For clarity, these are deferred to the real Phase 3 and must not be attempted now:
- Live Neon PostgreSQL database and data persistence
- Real stock reservation / inventory math
- Server-side role enforcement (RBAC middleware)
- Multi-location support
- Real-time activity logging
- Notifications (email / in-app)
- Full CRUD with delete on master data
- Custom/variable BOMs
