'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  products as seedProducts,
  rawMaterials as seedRawMaterials,
  boms as seedBoms,
  manufacturingOrders as seedMOs,
  purchaseOrders as seedPOs,
  salesOrders as seedSOs,
  quotations as seedQuotations,
} from './seed';
import {
  Bom,
  BomLine,
  ManufacturingOrder,
  Product,
  PurchaseOrder,
  Quotation,
  RawMaterial,
  SalesOrder,
} from './types';

/**
 * In-session ERP store (no database — Phase 2 demo rule). Single source of truth
 * for master data (products, raw materials, BOMs) AND documents; seeded from
 * lib/erp/seed and mutated by clicking through the app. Resets on refresh or
 * reset(). Mounted once in the shell so everything stays coherent across nav —
 * e.g. a product you add appears in the quotation dropdown, a BOM edit changes
 * the MO material check.
 *
 * NOTE: automatic inventory movement (decrement on production, etc.) is the real
 * Phase 3's job. Here, raw-material stock only changes via goods receipt and the
 * manual "Add Stock" top-up — both additive — matching the demo scope.
 */
interface ErpStoreValue {
  products: Product[];
  rawMaterials: RawMaterial[];
  boms: Bom[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  manufacturingOrders: ManufacturingOrder[];
  purchaseOrders: PurchaseOrder[];

  getProduct: (id: string) => Product | undefined;
  getMaterial: (id: string) => RawMaterial | undefined;
  getBom: (productId: string) => Bom | undefined;
  getQuotation: (id: string) => Quotation | undefined;
  getSalesOrder: (id: string) => SalesOrder | undefined;
  getManufacturingOrder: (id: string) => ManufacturingOrder | undefined;
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined;

  // Master data management (SOW deliverables 1-3)
  addProduct: (data: Omit<Product, 'id'>) => string;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  toggleProductStatus: (id: string) => void;
  addMaterial: (data: Omit<RawMaterial, 'id'>) => string;
  updateMaterial: (id: string, patch: Partial<RawMaterial>) => void;
  toggleMaterialStatus: (id: string) => void;
  addMaterialStock: (id: string, qty: number) => void;
  setBomLines: (productId: string, lines: BomLine[]) => void;

  // Documents
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
const today = () => new Date().toISOString().slice(0, 10);
const isActiveMaterial = (m: RawMaterial) => (m.status ?? 'Active') === 'Active';

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

const vendorForMaterial = (materialId: string) =>
  materialId === 'RM-203' || materialId === 'RM-210' ? 'VEN-502'
  : materialId === 'RM-205' || materialId === 'RM-206' || materialId === 'RM-207' ? 'VEN-503'
  : materialId === 'RM-215' ? 'VEN-506'
  : 'VEN-501';

export function ErpStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => clone(seedProducts));
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => clone(seedRawMaterials));
  const [boms, setBoms] = useState<Bom[]>(() => clone(seedBoms));
  const [quotations, setQuotations] = useState<Quotation[]>(() => clone(seedQuotations));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => clone(seedSOs));
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>(() => clone(seedMOs));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => clone(seedPOs));

  const getProduct = (id: string) => products.find((p) => p.id === id);
  const getMaterial = (id: string) => rawMaterials.find((m) => m.id === id);
  const getBom = (productId: string) => boms.find((b) => b.productId === productId);

  // --- Master data ---
  const addProduct = (data: Omit<Product, 'id'>) => {
    const id = `PRD-${maxNum(products.map((p) => p.id), 100) + 1}`;
    setProducts((prev) => [{ ...data, id }, ...prev]);
    setBoms((prev) => (prev.some((b) => b.productId === id) ? prev : [...prev, { productId: id, lines: [] }]));
    return id;
  };
  const updateProduct = (id: string, patch: Partial<Product>) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, id } : p)));
  const toggleProductStatus = (id: string) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p)));

  const addMaterial = (data: Omit<RawMaterial, 'id'>) => {
    const id = `RM-${maxNum(rawMaterials.map((m) => m.id), 200) + 1}`;
    setRawMaterials((prev) => [{ status: 'Active', ...data, id }, ...prev]);
    return id;
  };
  const updateMaterial = (id: string, patch: Partial<RawMaterial>) =>
    setRawMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch, id } : m)));
  const toggleMaterialStatus = (id: string) =>
    setRawMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, status: isActiveMaterial(m) ? 'Inactive' : 'Active' } : m)));
  const addMaterialStock = (id: string, qty: number) =>
    setRawMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, stock: m.stock + qty } : m)));

  const setBomLines = (productId: string, lines: BomLine[]) =>
    setBoms((prev) =>
      prev.some((b) => b.productId === productId)
        ? prev.map((b) => (b.productId === productId ? { ...b, lines } : b))
        : [...prev, { productId, lines }],
    );

  // --- Documents ---
  const addQuotation = (q: Omit<Quotation, 'id'>) => {
    const id = `QT-${maxNum(quotations.map((x) => x.id), 1000) + 1}`;
    setQuotations((prev) => [{ ...q, id }, ...prev]);
    return id;
  };

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

  const rejectQuotation = (id: string) =>
    setQuotations((prev) => prev.map((q) => (q.id === id && q.stage === 'Pending Approval' ? { ...q, stage: 'Draft' } : q)));

  const approveManufacturingOrder = (id: string) => {
    const mo = manufacturingOrders.find((m) => m.id === id);
    if (!mo || mo.stage !== 'Pending Approval') return;
    const bom = boms.find((b) => b.productId === mo.productId);
    const covered = new Set(mo.raisedPOs.map((pid) => purchaseOrders.find((p) => p.id === pid)?.materialId).filter(Boolean));
    let poCounter = maxNum(purchaseOrders.map((p) => p.id), 4000);
    const newPOs: PurchaseOrder[] = [];
    bom?.lines.forEach((line) => {
      const required = line.qtyPerUnit * mo.quantity;
      const available = rawMaterials.find((m) => m.id === line.materialId)?.stock ?? 0;
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
      setManufacturingOrders((prev) => prev.map((m) => (m.id === id ? { ...m, stage: 'Done', completedQty: m.quantity, sourceSO: soId } : m)));
      if (q) setQuotations((prev) => prev.map((x) => (x.id === mo.sourceQuotation ? { ...x, linkedSO: soId, stage: 'Sales Order Raised' } : x)));
      return;
    }
    setManufacturingOrders((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stage: next, completedQty: next === 'Done' ? m.quantity : m.completedQty } : m)),
    );
  };

  const approvePurchaseOrder = (id: string) =>
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id && po.stage === 'Pending Approval' ? { ...po, stage: 'Approved' } : po)));

  const confirmGoodsReceipt = (id: string, receivedQty: number) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po) return;
    setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? { ...p, stage: 'Goods Received', receivedQty } : p)));
    setRawMaterials((prev) => prev.map((m) => (m.id === po.materialId ? { ...m, stock: m.stock + receivedQty } : m)));
  };

  const advanceSalesOrder = (id: string) =>
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id !== id) return so;
        const next = SO_NEXT[so.stage];
        return next ? { ...so, stage: next } : so;
      }),
    );

  const reset = () => {
    setProducts(clone(seedProducts));
    setRawMaterials(clone(seedRawMaterials));
    setBoms(clone(seedBoms));
    setQuotations(clone(seedQuotations));
    setSalesOrders(clone(seedSOs));
    setManufacturingOrders(clone(seedMOs));
    setPurchaseOrders(clone(seedPOs));
  };

  const value: ErpStoreValue = {
    products,
    rawMaterials,
    boms,
    quotations,
    salesOrders,
    manufacturingOrders,
    purchaseOrders,
    getProduct,
    getMaterial,
    getBom,
    getQuotation: (id) => quotations.find((q) => q.id === id),
    getSalesOrder: (id) => salesOrders.find((s) => s.id === id),
    getManufacturingOrder: (id) => manufacturingOrders.find((m) => m.id === id),
    getPurchaseOrder: (id) => purchaseOrders.find((p) => p.id === id),
    addProduct,
    updateProduct,
    toggleProductStatus,
    addMaterial,
    updateMaterial,
    toggleMaterialStatus,
    addMaterialStock,
    setBomLines,
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
