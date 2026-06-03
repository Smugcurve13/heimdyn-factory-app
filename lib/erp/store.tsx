'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  products,
  boms,
  rawMaterials,
  manufacturingOrders as seedMOs,
  purchaseOrders as seedPOs,
  salesOrders as seedSOs,
  quotations as seedQuotations,
} from './seed';
import {
  ManufacturingOrder,
  PurchaseOrder,
  Quotation,
  SalesOrder,
} from './types';

/**
 * In-session ERP document store (no database — Phase 2 demo rule). Seeded from
 * lib/erp/seed and mutated by clicking through the modules; resets on refresh
 * or via reset(). Mounted once in the app shell so changes persist across nav.
 *
 * Phase 5: approving the stock-short demo quotation (QT-1002) cascades —
 * quote → Manufacturing Order → Purchase Order → goods receipt (raises the
 * material's stock so the MO's BOM row flips to Sufficient) → complete MO →
 * Sales Order created automatically (golden rule: SOs are never made by hand).
 */
interface ErpStoreValue {
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  manufacturingOrders: ManufacturingOrder[];
  purchaseOrders: PurchaseOrder[];

  getQuotation: (id: string) => Quotation | undefined;
  getSalesOrder: (id: string) => SalesOrder | undefined;
  getManufacturingOrder: (id: string) => ManufacturingOrder | undefined;
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined;
  getMaterialStock: (id: string) => number;

  addQuotation: (q: Omit<Quotation, 'id'>) => string;
  approveQuotation: (id: string) => void;
  rejectQuotation: (id: string) => void;

  approvePurchaseOrder: (id: string) => void;
  confirmGoodsReceipt: (id: string, receivedQty: number) => void;
  approveManufacturingOrder: (id: string) => void;
  advanceManufacturingOrder: (id: string) => void;
  advanceSalesOrder: (id: string) => void;

  reset: () => void;
}

const ErpStoreContext = createContext<ErpStoreValue | undefined>(undefined);

const clone = <T,>(arr: T[]): T[] => JSON.parse(JSON.stringify(arr));
const seedStock = () => Object.fromEntries(rawMaterials.map((m) => [m.id, m.stock]));
const today = () => new Date().toISOString().slice(0, 10);

const MO_NEXT: Record<string, ManufacturingOrder['stage']> = {
  'Pending Approval': 'Planned',
  Planned: 'In Progress',
  'In Progress': 'Done',
};
const SO_NEXT: Record<string, SalesOrder['stage']> = {
  Confirmed: 'Stock Committed',
  'Stock Committed': 'Dispatched',
  Dispatched: 'Invoiced',
};

const maxNum = (ids: string[], base: number) =>
  ids.reduce((m, id) => {
    const n = parseInt(id.replace(/\D/g, ''), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, base);

// Rough vendor routing for auto-raised POs (cosmetic).
const vendorForMaterial = (materialId: string) =>
  materialId === 'RM-203' || materialId === 'RM-210' ? 'VEN-502'
  : materialId === 'RM-205' || materialId === 'RM-206' || materialId === 'RM-207' ? 'VEN-503'
  : materialId === 'RM-215' ? 'VEN-506'
  : 'VEN-501';

export function ErpStoreProvider({ children }: { children: ReactNode }) {
  const [quotations, setQuotations] = useState<Quotation[]>(() => clone(seedQuotations));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => clone(seedSOs));
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>(() => clone(seedMOs));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => clone(seedPOs));
  const [materialStock, setMaterialStock] = useState<Record<string, number>>(seedStock);

  const addQuotation = (q: Omit<Quotation, 'id'>) => {
    const id = `QT-${maxNum(quotations.map((x) => x.id), 1000) + 1}`;
    setQuotations((prev) => [{ ...q, id }, ...prev]);
    return id;
  };

  // Approving a stock-short quotation spins up a Manufacturing Order (Path B);
  // a sufficient quotation simply advances. (Phase 5 demo = QT-1002.)
  const approveQuotation = (id: string) => {
    const q = quotations.find((x) => x.id === id);
    if (!q || q.stage !== 'Pending Approval') return;

    if (q.stockShort) {
      const moId = `MO-${maxNum(manufacturingOrders.map((m) => m.id), 3000) + 1}`;
      const line = q.lines[0];
      const mo: ManufacturingOrder = {
        id: moId,
        date: today(),
        stage: 'Pending Approval',
        productId: line.productId,
        quantity: line.quantity,
        completedQty: 0,
        sourceQuotation: q.id,
        sourceSO: null,
        raisedPOs: [],
      };
      setManufacturingOrders((prev) => [mo, ...prev]);
      setQuotations((prev) => prev.map((x) => (x.id === id ? { ...x, stage: 'Proforma Invoice', linkedMO: moId } : x)));
    } else {
      setQuotations((prev) => prev.map((x) => (x.id === id ? { ...x, stage: 'Proforma Invoice' } : x)));
    }
  };

  const rejectQuotation = (id: string) => {
    setQuotations((prev) => prev.map((q) => (q.id === id && q.stage === 'Pending Approval' ? { ...q, stage: 'Draft' } : q)));
  };

  // Approving an MO checks its BOM against live stock and auto-raises a PO for
  // every short material (the demo MO is short on RM-203 → one PO).
  const approveManufacturingOrder = (id: string) => {
    const mo = manufacturingOrders.find((m) => m.id === id);
    if (!mo || mo.stage !== 'Pending Approval') return;

    const bom = boms.find((b) => b.productId === mo.productId);
    const covered = new Set(
      mo.raisedPOs.map((pid) => purchaseOrders.find((p) => p.id === pid)?.materialId).filter(Boolean),
    );
    let poCounter = maxNum(purchaseOrders.map((p) => p.id), 4000);
    const newPOs: PurchaseOrder[] = [];

    bom?.lines.forEach((line) => {
      const required = line.qtyPerUnit * mo.quantity;
      const available = materialStock[line.materialId] ?? 0;
      if (available < required && !covered.has(line.materialId)) {
        poCounter += 1;
        const shortfall = required - available;
        newPOs.push({
          id: `PO-${poCounter}`,
          date: today(),
          stage: 'Pending Approval',
          vendorId: vendorForMaterial(line.materialId),
          materialId: line.materialId,
          quantity: shortfall,
          valueUsd: Math.round(shortfall * 5),
          receivedQty: 0,
          sourceMO: mo.id,
        });
      }
    });

    if (newPOs.length) setPurchaseOrders((prev) => [...newPOs, ...prev]);
    setManufacturingOrders((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stage: 'Planned', raisedPOs: [...m.raisedPOs, ...newPOs.map((p) => p.id)] } : m)),
    );
  };

  const advanceManufacturingOrder = (id: string) => {
    const mo = manufacturingOrders.find((m) => m.id === id);
    if (!mo) return;
    const next = MO_NEXT[mo.stage];
    if (!next) return;

    // Completing an MO that has a source quotation but no SO yet => the system
    // raises the Sales Order automatically (golden rule).
    if (next === 'Done' && mo.sourceQuotation && !mo.sourceSO) {
      const q = quotations.find((x) => x.id === mo.sourceQuotation);
      const soId = `SO-${maxNum(salesOrders.map((s) => s.id), 2000) + 1}`;
      const product = products.find((p) => p.id === mo.productId);
      const so: SalesOrder = {
        id: soId,
        customerId: q?.customerId ?? '',
        date: today(),
        stage: 'Confirmed',
        productId: mo.productId,
        quantity: mo.quantity,
        valueUsd: mo.quantity * (product?.priceUsd ?? 0),
        sourceQuotation: mo.sourceQuotation,
        sourceMO: mo.id,
      };
      setSalesOrders((prev) => [so, ...prev]);
      setManufacturingOrders((prev) =>
        prev.map((m) => (m.id === id ? { ...m, stage: 'Done', completedQty: m.quantity, sourceSO: soId } : m)),
      );
      if (q) {
        setQuotations((prev) =>
          prev.map((x) => (x.id === mo.sourceQuotation ? { ...x, linkedSO: soId, stage: 'Sales Order Raised' } : x)),
        );
      }
      return;
    }

    setManufacturingOrders((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stage: next, completedQty: next === 'Done' ? m.quantity : m.completedQty } : m)),
    );
  };

  const approvePurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id && po.stage === 'Pending Approval' ? { ...po, stage: 'Approved' } : po)));
  };

  // Receiving goods raises the material's stock so the linked MO's BOM check flips.
  const confirmGoodsReceipt = (id: string, receivedQty: number) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po) return;
    setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? { ...p, stage: 'Goods Received', receivedQty } : p)));
    setMaterialStock((prev) => ({ ...prev, [po.materialId]: (prev[po.materialId] ?? 0) + receivedQty }));
  };

  const advanceSalesOrder = (id: string) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id !== id) return so;
        const next = SO_NEXT[so.stage];
        return next ? { ...so, stage: next } : so;
      }),
    );
  };

  const reset = () => {
    setQuotations(clone(seedQuotations));
    setSalesOrders(clone(seedSOs));
    setManufacturingOrders(clone(seedMOs));
    setPurchaseOrders(clone(seedPOs));
    setMaterialStock(seedStock());
  };

  const value: ErpStoreValue = {
    quotations,
    salesOrders,
    manufacturingOrders,
    purchaseOrders,
    getQuotation: (id) => quotations.find((q) => q.id === id),
    getSalesOrder: (id) => salesOrders.find((s) => s.id === id),
    getManufacturingOrder: (id) => manufacturingOrders.find((m) => m.id === id),
    getPurchaseOrder: (id) => purchaseOrders.find((p) => p.id === id),
    getMaterialStock: (id) => materialStock[id] ?? 0,
    addQuotation,
    approveQuotation,
    rejectQuotation,
    approvePurchaseOrder,
    confirmGoodsReceipt,
    approveManufacturingOrder,
    advanceManufacturingOrder,
    advanceSalesOrder,
    reset,
  };

  return <ErpStoreContext.Provider value={value}>{children}</ErpStoreContext.Provider>;
}

export function useErpStore() {
  const ctx = useContext(ErpStoreContext);
  if (!ctx) throw new Error('useErpStore must be used within an ErpStoreProvider');
  return ctx;
}
