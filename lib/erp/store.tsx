'use client';

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import {
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
 * lib/erp/seed and mutated by clicking through the modules; resets on refresh.
 * Mounted once in the app shell so status changes persist across navigation
 * (and feed the Phase 5 cascade + Document Trail).
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

  approvePurchaseOrder: (id: string) => void;
  confirmGoodsReceipt: (id: string, receivedQty: number) => void;
  approveManufacturingOrder: (id: string) => void;
  advanceManufacturingOrder: (id: string) => void;
}

const ErpStoreContext = createContext<ErpStoreValue | undefined>(undefined);

const clone = <T,>(arr: T[]): T[] => JSON.parse(JSON.stringify(arr));

const MO_NEXT: Record<string, ManufacturingOrder['stage']> = {
  'Pending Approval': 'Planned',
  Planned: 'In Progress',
  'In Progress': 'Done',
};

export function ErpStoreProvider({ children }: { children: ReactNode }) {
  const [quotations, setQuotations] = useState<Quotation[]>(() => clone(seedQuotations));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => clone(seedSOs));
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>(() => clone(seedMOs));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => clone(seedPOs));

  const approvePurchaseOrder = useCallback((id: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id && po.stage === 'Pending Approval' ? { ...po, stage: 'Approved' } : po)),
    );
  }, []);

  const confirmGoodsReceipt = useCallback((id: string, receivedQty: number) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, stage: 'Goods Received', receivedQty } : po)),
    );
  }, []);

  const approveManufacturingOrder = useCallback((id: string) => {
    setManufacturingOrders((prev) =>
      prev.map((mo) => (mo.id === id && mo.stage === 'Pending Approval' ? { ...mo, stage: 'Planned' } : mo)),
    );
  }, []);

  const advanceManufacturingOrder = useCallback((id: string) => {
    setManufacturingOrders((prev) =>
      prev.map((mo) => {
        if (mo.id !== id) return mo;
        const next = MO_NEXT[mo.stage];
        if (!next) return mo;
        return { ...mo, stage: next, completedQty: next === 'Done' ? mo.quantity : mo.completedQty };
      }),
    );
  }, []);

  const value = useMemo<ErpStoreValue>(
    () => ({
      quotations,
      salesOrders,
      manufacturingOrders,
      purchaseOrders,
      getQuotation: (id) => quotations.find((q) => q.id === id),
      getSalesOrder: (id) => salesOrders.find((s) => s.id === id),
      getManufacturingOrder: (id) => manufacturingOrders.find((m) => m.id === id),
      getPurchaseOrder: (id) => purchaseOrders.find((p) => p.id === id),
      approvePurchaseOrder,
      confirmGoodsReceipt,
      approveManufacturingOrder,
      advanceManufacturingOrder,
    }),
    [
      quotations,
      salesOrders,
      manufacturingOrders,
      purchaseOrders,
      approvePurchaseOrder,
      confirmGoodsReceipt,
      approveManufacturingOrder,
      advanceManufacturingOrder,
    ],
  );

  return <ErpStoreContext.Provider value={value}>{children}</ErpStoreContext.Provider>;
}

export function useErpStore() {
  const ctx = useContext(ErpStoreContext);
  if (!ctx) throw new Error('useErpStore must be used within an ErpStoreProvider');
  return ctx;
}
