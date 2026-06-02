import {
  products,
  rawMaterials,
  vendors,
  customers,
  quotations,
  salesOrders,
  manufacturingOrders,
  purchaseOrders,
} from './seed';
// --- Lookups by ID (used across modules + the Document Trail) ---
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getMaterial = (id: string) => rawMaterials.find((m) => m.id === id);
export const getVendor = (id: string) => vendors.find((v) => v.id === id);
export const getCustomer = (id: string) => customers.find((c) => c.id === id);
export const getQuotation = (id: string) => quotations.find((q) => q.id === id);
export const getSalesOrder = (id: string) => salesOrders.find((s) => s.id === id);
export const getManufacturingOrder = (id: string) => manufacturingOrders.find((m) => m.id === id);
export const getPurchaseOrder = (id: string) => purchaseOrders.find((p) => p.id === id);

// --- Pipeline stage counts (drives dashboard pipeline bars) ---
const countBy = <T>(items: T[], key: (item: T) => string) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

export const quotationsByStage = () => countBy(quotations, (q) => q.stage);
export const salesOrdersByStage = () => countBy(salesOrders, (s) => s.stage);
export const manufacturingByStage = () => countBy(manufacturingOrders, (m) => m.stage);
export const purchaseByStage = () => countBy(purchaseOrders, (p) => p.stage);

// --- Headline KPIs (drives dashboard cards) ---
export const erpKpis = () => {
  const openQuotations = quotations.filter((q) => q.stage !== 'Sales Order Raised').length;
  const openSalesOrders = salesOrders.filter((s) => s.stage !== 'Invoiced').length;
  const activeManufacturing = manufacturingOrders.filter((m) => m.stage !== 'Done').length;
  const openPurchaseOrders = purchaseOrders.filter((p) => p.stage !== 'Goods Received');
  const pendingPurchaseValue = openPurchaseOrders.reduce((sum, p) => sum + p.valueUsd, 0);

  const finishedGoodsUnits = products.reduce((sum, p) => sum + p.finishedStock, 0);
  const requiresMo = quotations.filter((q) => q.stockShort && q.stage !== 'Sales Order Raised').length;

  return {
    openQuotations,
    openSalesOrders,
    activeManufacturing,
    openPurchaseOrders: openPurchaseOrders.length,
    pendingPurchaseValue,
    finishedGoodsUnits,
    requiresMo,
  };
};

// --- Stock status (drives inventory pills) ---
import { StockStatus } from './types';

export const stockStatus = (stock: number, reorderLevel: number): StockStatus => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorderLevel) return 'Low Stock';
  return 'In Stock';
};

/** Whole-dollar USD — for large totals (KPIs, order values). */
export const formatUsd = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

/** Cent-precision USD — for unit prices. */
export const formatPrice = (value: number) => formatUsd(value, 2);
