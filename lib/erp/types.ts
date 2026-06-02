/**
 * Heimdyn ERP — Phase 2 demo data model.
 *
 * Demo-first: every record below lives in seeded TypeScript (lib/erp/seed/*).
 * There is no database in Phase 2. Cross-reference IDs (sourceQuotation, sourceMO,
 * raisedPOs, etc.) are what drive the Document Trail across modules.
 */

// --- ID prefixes (the backbone of the Document Trail) ---
// PRD- product · RM- raw material · VEN- vendor · CUS- customer
// QT- quotation · SO- sales order · MO- manufacturing order · PO- purchase order

export type ProductType = 'New Pallet' | 'Recycled Pallet';
export type ProductStatus = 'Active' | 'Inactive';
export type UnitOfMeasure = 'metres' | 'units' | 'kilograms' | 'gallons';

export type QuotationStage =
  | 'Draft'
  | 'Pending Approval'
  | 'Proforma Invoice'
  | 'Sales Order Raised';

export type SalesOrderStage =
  | 'Confirmed'
  | 'Stock Committed'
  | 'Dispatched'
  | 'Invoiced';

export type ManufacturingStage =
  | 'Pending Approval'
  | 'Planned'
  | 'In Progress'
  | 'Done';

export type PurchaseStage = 'Pending Approval' | 'Approved' | 'Goods Received';

// --- Master data ---

export interface Product {
  id: string; // PRD-1xx
  name: string;
  type: ProductType;
  priceUsd: number;
  status: ProductStatus;
  /** Finished-goods units currently on the shelf. */
  finishedStock: number;
}

export interface RawMaterial {
  id: string; // RM-2xx
  name: string;
  uom: UnitOfMeasure;
  /** Current quantity on hand, in the material's unit of measure. */
  stock: number;
}

export interface BomLine {
  materialId: string; // RM-2xx
  qtyPerUnit: number;
}

export interface Bom {
  productId: string; // PRD-1xx
  lines: BomLine[];
}

export interface Vendor {
  id: string; // VEN-5xx
  name: string;
  category: string;
}

export interface Customer {
  id: string; // CUS-6xx
  name: string;
  city: string;
}

// --- Documents (interlinked) ---

export interface QuotationLine {
  productId: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface Quotation {
  id: string; // QT-1xxx
  customerId: string;
  date: string; // ISO yyyy-mm-dd
  stage: QuotationStage;
  /** true => stock is short => "Requires MO" badge on the board. */
  stockShort: boolean;
  lines: QuotationLine[];
  /** Set once the system has spun up manufacturing for this quote. */
  linkedMO?: string | null;
  /** Set once the system has raised the Sales Order (never created by hand). */
  linkedSO?: string | null;
}

export interface SalesOrder {
  id: string; // SO-2xxx
  customerId: string;
  date: string;
  stage: SalesOrderStage;
  productId: string;
  quantity: number;
  valueUsd: number;
  /** Always present — an SO only ever exists because a quotation was approved. */
  sourceQuotation: string;
  /** Present on Path B (manufactured) orders; null on Path A (ex-stock). */
  sourceMO?: string | null;
}

export interface ManufacturingOrder {
  id: string; // MO-3xxx
  date: string;
  stage: ManufacturingStage;
  productId: string;
  quantity: number;
  completedQty: number;
  /** Null for build-ahead MOs created manually by the Production Manager. */
  sourceQuotation?: string | null;
  sourceSO?: string | null;
  /** Purchase Orders this MO auto-raised for short materials. */
  raisedPOs: string[];
}

export interface PurchaseOrder {
  id: string; // PO-4xxx
  date: string;
  stage: PurchaseStage;
  vendorId: string;
  materialId: string;
  quantity: number;
  valueUsd: number;
  receivedQty: number;
  /** The manufacturing order whose material shortfall triggered this PO. */
  sourceMO: string;
}
