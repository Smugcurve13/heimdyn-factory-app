# Heimdyn — Pallet Manufacturing ERP
## Scope of Work — Phase 2

> **Project:** Heimdyn Factory ERP — Manufacturing Module
> **Prepared For:** Advance Lumber & Pallet Ltd. · Surrey, BC
> **Phase:** Phase 2 — ERP Core (Showcase Build)
> **Prepared By:** Heimdyn Development Team
> **Version:** 1.0 · May 2026
> **Status:** Finalised

---

## 1. Executive Summary

This document sets out exactly what will be built in Phase 2 of the Heimdyn platform: a streamlined Enterprise Resource Planning (ERP) system purpose-built for a wooden pallet manufacturer.

Phase 1 delivered a factory operations dashboard. Phase 2 brings the business to life — connecting sales, manufacturing, purchasing and inventory into one flowing system where a single customer enquiry can ripple through to a production order, a material purchase, and a finished delivery, all automatically linked.

The design philosophy is deliberate: take the proven logic of a full MRP system, and strip it down to a clean, intuitive core that an operations team can pick up in minutes — not weeks. Every screen prioritises clarity over clutter.

**Phase 2 — What we build now:** A fully working ERP interface covering the complete order-to-delivery and purchase-to-stock journeys, ready for live demonstration. Built on realistic sample data.

**Phase 3 — What comes next:** Connecting the system to a live, secure database with multi-location support, and full onboarding of Advance Lumber & Pallet as a live client.

**At a glance:**
- **5 Modules** — Quotations, Sales, Manufacturing, Purchasing & Inventory, all talking to each other.
- **6 User Roles** — clear responsibilities and approval gates for every person in the workflow.
- **2 Pallet Lines** — new and recycled pallets, the two core products in scope.

---

## 2. How the System Works

Everything starts with three master records and flows through five connected modules. The master data is the foundation — the catalogue of what you sell, what you build with, and the recipe that links the two. On top of that sit the five working modules where the day-to-day business happens.

The single most important idea in this system is **connection**. In most basic software, a sales record and a purchase record live in separate worlds. Here, they are linked end to end. Open any document and you can trace its entire family tree — the sale that started it, the production order it triggered, and the material purchase that fed it.

---

## 3. The Core Business Flow

There are two routes a customer order can take. The system decides automatically which one applies, based on whether the product is already in stock.

### 3.1 Path A — Stock is available

The simplest journey. The customer wants something we already have on the shelf.

1. A Sales Executive creates a **quotation**, choosing the pallet and quantity. The system checks stock in real time as they type.
2. The quotation is submitted, and the **Sales Manager approves** it.
3. The system confirms **stock is sufficient** and automatically raises a **Sales Order**, marking that stock as committed to the order.
4. Goods are **dispatched**, and inventory is reduced automatically.
5. **Accounts** raises the tax invoice and records payment. Done.

### 3.2 Path B — Manufacturing is required

When stock runs short, the system quietly does the heavy lifting — spinning up production and ordering materials without anyone chasing paperwork.

1. The quotation is approved as before, but the **stock check comes back short**.
2. The system automatically creates a **Manufacturing Order** and sends it to the Production Manager.
3. On approval, the system checks the **recipe (BOM)** against raw material stock. Where materials are short, it **auto-raises Purchase Orders**.
4. The **Purchase Manager approves** the orders; materials arrive and are **received into stock**.
5. **Production runs**, the order is marked complete, and finished pallets flow into inventory.
6. The **Sales Order is now created automatically** — and the order rejoins Path A for dispatch and invoicing.

> **The golden rule:** A Sales Order is never created by hand. The system always creates it — either immediately when stock exists, or after manufacturing finishes when it doesn't. This keeps the numbers honest and removes guesswork.

---

## 4. Master Data Foundation

Three foundational records hold everything together. These are set up once, at the start.

### Product Master — what you sell

Every sellable, buildable pallet. Only physical products are in scope — new pallets and recycled pallets.

| Detail captured | Example |
|---|---|
| Product name & code | Euro Pallet Standard 1200×800mm · EPAL-100 |
| Type | New Pallet / Recycled Pallet |
| Price (USD) | Selling price in USD |
| Status | Active / Inactive |

### Raw Material Master — what you build with

Every material consumed in production — lumber, nails, fasteners, treatment labels.

| Detail captured | Example |
|---|---|
| Material name & code | Pine Planks 2×4, Steel Nails 2" |
| Unit of measure | metres, units, kilograms, gallons |
| Current stock | Opening quantity on hand |

### Bill of Materials — the recipe

For each product, a fixed recipe listing the materials and quantities needed to build one unit. In Phase 2 these use realistic sample data for pallet construction.

---

## 5. The Modules in Detail

### 5.1 Quotations

The starting point of every sale. Presented as a visual pipeline board, so the whole team can see at a glance where every enquiry stands.

**Stage flow:** Draft → Pending Approval → Proforma Invoice → Sales Order Raised

- Sales Executives build quotations; the Sales Manager approves them.
- A live stock indicator shows green when items are in stock, amber when production will be needed.
- Cards needing manufacturing are flagged **Requires MO** right on the board.
- Pricing shown in USD on every quote.

### 5.2 Sales Orders

Confirmed business, ready to fulfil. Always created by the system — never by hand.

**Stage flow:** Confirmed → Stock Committed → Dispatched → Invoiced

Each Sales Order carries its full history — the quotation it came from, and the manufacturing order behind it where relevant.

### 5.3 Manufacturing Orders

Where production is planned and tracked. Created automatically when stock is short, or manually by the Production Manager to build ahead.

**Stage flow:** Pending Approval → Planned → In Progress → Done

- A built-in BOM breakdown shows exactly which materials are sufficient and which fall short.
- Short materials are flagged instantly, and the system shows a **PO Raised** badge once it has ordered them.
- A progress indicator shows units completed against the target, updated by the Production Manager.

> **Inventory moves automatically:**
> - Raw materials are consumed the moment an order moves to **In Progress**.
> - Finished pallets are added to stock the moment an order is marked **Done**.

### 5.4 Purchase Orders

Material procurement, triggered automatically by production shortfalls. The Purchase Manager approves and receives.

**Stage flow:** Pending Approval → Approved → Goods Received

- Generated automatically when a manufacturing order is short on materials — no manual creation needed.
- A summary bar displays open orders and total pending value.
- Recording goods receipt updates raw material stock instantly.

### 5.5 Inventory

Two clearly separated stock pools that keep themselves up to date.

| Stock Pool | Goes down when | Goes up when |
|---|---|---|
| **Finished Goods** | An order is dispatched | Manufacturing completes |
| **Raw Materials** | Production begins (consuming the recipe) | Goods are received, or stock is added manually |

The only manual action is topping up raw materials directly — useful for recycled pallet inputs that arrive outside the purchasing system.

---

## 6. Who Does What — User Roles

Six roles, each with clear responsibilities and the right approval gates. People see only what they need. Admin oversees the whole system.

| Role | Responsibilities |
|---|---|
| **Admin** | Full access. Manages all master data and users. Can act across every module. |
| **Sales Executive** | Creates and submits quotations. Views order status and stock availability. Cannot approve. |
| **Sales Manager** | Approves or rejects quotations. Oversees all sales activity and analytics. |
| **Production Manager** | Approves manufacturing orders and drives them through production to completion. |
| **Purchase Manager** | Approves purchase orders and records incoming goods against them. |
| **Accounts** | Raises tax invoices from confirmed orders and tracks payment. View-only on operations. |

---

## 7. What's Included — Deliverables

The complete set of working components delivered at the end of Phase 2.

| # | Deliverable | How we'll know it's done |
|---|---|---|
| 1 | Product Master with full management | Products can be added, edited, deactivated |
| 2 | Raw Material Master with full management | Materials can be added, edited, deactivated |
| 3 | Bill of Materials editor | Recipes can be defined and updated per product |
| 4 | Quotations module (board, detail view, 3-step creation) | Pipeline visible, creation works, stock check live |
| 5 | Sales Orders module with auto-creation | Orders appear automatically with correct status flow |
| 6 | Manufacturing Orders with approvals & BOM view | Auto-created, approvable, material check visible |
| 7 | Purchase Orders with approvals & goods receipt | Auto-raised, approvable, receipt updates stock |
| 8 | Inventory with two stock pools | Accurate levels, manual top-up works |
| 9 | Dashboard updated with live ERP figures | KPIs, pipeline bars and activity feed all working |
| 10 | Role-based access for all six roles | Each role sees only its permitted actions |
| 11 | Document Trail across every module | Linked history visible in each detail view |
| 12 | USD currency support | Pricing and totals shown in USD across all documents |
| 13 | Sample data across the whole system | Demo-ready out of the box |

---

## 8. What's Not Included

To keep Phase 2 focused and deliverable, the following are intentionally left out. Each can be added later through a simple change request.

| Area | Not included in Phase 2 |
|---|---|
| Other product lines | Pallet repairs (a service) and pre-cut lumber (trading). Only new and recycled pallets are in scope. |
| Multiple locations | The system assumes a single factory and warehouse for now. |
| Live database | Phase 2 runs on realistic sample data; the live database arrives in Phase 3. |
| Automatic reordering | No automatic stock-level reorder rules. Purchases are triggered only by production needs. |
| Accounting integration | No link to accounting software, general ledger or payment gateways. |
| Customer returns | No inbound returns flow; recycled pallet inputs are entered manually. |
| Custom recipes | Bills of materials are fixed per product; custom-dimension recipes come later. |
| Existing analytics pages | The original dashboard analytics pages stay as they are. |

---

## 9. Assumptions & Dependencies

### 9.1 Assumptions

- All data in Phase 2 is realistic sample data, to be replaced with live data in Phase 3.
- Bill of materials definitions will use realistic pallet manufacturing data provided by our team.
- The approved Heimdyn design system and prototype screens are the reference for all visuals.
- No external integrations are required at this stage.
- Vendor records for purchasing use the existing vendor module from Phase 1.
- A Sales Order is created automatically by the system — never by hand. Once a quotation is approved (and stock is ready), the system raises the Sales Order itself. Staff cannot manually create or "convert" one.

### 9.2 Dependencies

- The Phase 1 platform must be stable and deployed before Phase 2 begins.
- The existing users module will be extended to include the six new roles.
- The design system remains fixed; any visual changes need a separate review.

---

## 10. Managing Change

Anything outside this document follows a simple, transparent process — so there are never surprises on either side.

1. A written change request describes what's wanted and why.
2. We review the impact on timeline and approach.
3. If agreed, this document is updated, versioned and re-signed.
4. No out-of-scope work begins without that sign-off.

---

## 11. Agreement & Sign-off

By signing, both parties agree to the scope described in this document. Development of Phase 2 begins once signatures are in place.

**Version History**

| Version | Date | Author | Summary |
|---|---|---|---|
| 1.0 | May 2026 | Heimdyn Development Team | Initial scope — Phase 2 ERP defined |
