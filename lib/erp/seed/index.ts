import { products } from './products';
import { rawMaterials } from './raw-materials';
import { boms } from './boms';
import { vendors } from './vendors';
import { customers } from './customers';
import { quotations } from './quotations';
import { salesOrders } from './sales-orders';
import { manufacturingOrders } from './manufacturing-orders';
import { purchaseOrders } from './purchase-orders';

export { products, rawMaterials, boms, vendors, customers };
export { quotations, salesOrders, manufacturingOrders, purchaseOrders };

/**
 * Phase 5 scripted demo. QT-1002 starts at "Pending Approval" and is short on stock;
 * approving it spins up the cascade below in-session. These downstream IDs are
 * reserved here (not pre-seeded as live documents) so Phase 5 can create them on cue.
 */
export const DEMO_FLOW = {
  quotationId: 'QT-1002',
  reserved: {
    manufacturingOrderId: 'MO-3010',
    purchaseOrderId: 'PO-4010', // for the one short material, RM-203 Hardwood Block
    salesOrderId: 'SO-2010',
  },
} as const;

/**
 * Integrity guard: every cross-reference ID must resolve. Run at module load in
 * development so a dangling link (typo'd linkedSO, sourceMO, raisedPOs, etc.)
 * surfaces immediately rather than as a silent blank in a drawer.
 */
export function assertSeedIntegrity(): void {
  const errors: string[] = [];

  const productIds = new Set(products.map((p) => p.id));
  const materialIds = new Set(rawMaterials.map((m) => m.id));
  const vendorIds = new Set(vendors.map((v) => v.id));
  const customerIds = new Set(customers.map((c) => c.id));
  const quotationIds = new Set(quotations.map((q) => q.id));
  const salesOrderIds = new Set(salesOrders.map((s) => s.id));
  const manufacturingIds = new Set(manufacturingOrders.map((m) => m.id));
  const purchaseIds = new Set(purchaseOrders.map((p) => p.id));

  const check = (ok: boolean, msg: string) => {
    if (!ok) errors.push(msg);
  };

  // Every product needs a BOM; every BOM line must reference a real material.
  for (const p of products) {
    check(boms.some((b) => b.productId === p.id), `Product ${p.id} has no BOM`);
  }
  for (const b of boms) {
    check(productIds.has(b.productId), `BOM references missing product ${b.productId}`);
    for (const line of b.lines) {
      check(materialIds.has(line.materialId), `BOM ${b.productId} references missing material ${line.materialId}`);
    }
  }

  for (const q of quotations) {
    check(customerIds.has(q.customerId), `${q.id} references missing customer ${q.customerId}`);
    for (const line of q.lines) {
      check(productIds.has(line.productId), `${q.id} references missing product ${line.productId}`);
    }
    if (q.linkedMO) check(manufacturingIds.has(q.linkedMO), `${q.id}.linkedMO ${q.linkedMO} not found`);
    if (q.linkedSO) check(salesOrderIds.has(q.linkedSO), `${q.id}.linkedSO ${q.linkedSO} not found`);
  }

  for (const s of salesOrders) {
    check(customerIds.has(s.customerId), `${s.id} references missing customer ${s.customerId}`);
    check(productIds.has(s.productId), `${s.id} references missing product ${s.productId}`);
    check(quotationIds.has(s.sourceQuotation), `${s.id}.sourceQuotation ${s.sourceQuotation} not found`);
    if (s.sourceMO) check(manufacturingIds.has(s.sourceMO), `${s.id}.sourceMO ${s.sourceMO} not found`);
  }

  for (const m of manufacturingOrders) {
    check(productIds.has(m.productId), `${m.id} references missing product ${m.productId}`);
    if (m.sourceQuotation) check(quotationIds.has(m.sourceQuotation), `${m.id}.sourceQuotation ${m.sourceQuotation} not found`);
    if (m.sourceSO) check(salesOrderIds.has(m.sourceSO), `${m.id}.sourceSO ${m.sourceSO} not found`);
    for (const po of m.raisedPOs) {
      check(purchaseIds.has(po), `${m.id}.raisedPOs references missing PO ${po}`);
    }
  }

  for (const p of purchaseOrders) {
    check(vendorIds.has(p.vendorId), `${p.id} references missing vendor ${p.vendorId}`);
    check(materialIds.has(p.materialId), `${p.id} references missing material ${p.materialId}`);
    check(manufacturingIds.has(p.sourceMO), `${p.id}.sourceMO ${p.sourceMO} not found`);
  }

  if (errors.length > 0) {
    throw new Error(`[erp seed] integrity check failed:\n - ${errors.join('\n - ')}`);
  }
}

if (process.env.NODE_ENV !== 'production') {
  assertSeedIntegrity();
}
