import type { Customer, CustomerErpData, Vendor, VendorErpData } from '@/services/api';
import customerMockData from '@/data/customers/mock-erp.json';
import vendorMockData from '@/data/vendors/mock-erp.json';

const customerErp = customerMockData as Record<string, CustomerErpData>;
const vendorErp = vendorMockData as Record<string, VendorErpData>;

export function getCustomerErpData(customerName: string): CustomerErpData | null {
  return customerErp[customerName] ?? null;
}

export function getVendorErpData(vendorName: string): VendorErpData | null {
  return vendorErp[vendorName] ?? null;
}

export function getAllCustomerErpData(): Record<string, CustomerErpData> {
  return customerErp;
}

export function getAllVendorErpData(): Record<string, VendorErpData> {
  return vendorErp;
}

function sumOrders(erp: CustomerErpData) {
  return erp.orders.length;
}

function sumRevenue(erp: CustomerErpData) {
  return erp.orders.reduce((sum, o) => sum + o.amount, 0);
}

function sumOutstanding(erp: CustomerErpData) {
  return erp.invoices
    .filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);
}

function lastPurchaseDate(erp: CustomerErpData): string | null {
  if (!erp.orders.length) return null;
  return erp.orders.sort((a, b) => b.date.localeCompare(a.date))[0].date;
}

export function getCustomerTableRow(customer: Customer) {
  const erp = getCustomerErpData(customer.name);
  if (!erp) {
    return {
      orders: 0,
      revenue: 0,
      lastPurchase: null as string | null,
      outstanding: 0,
      health: 'Low Activity' as const,
    };
  }
  return {
    orders: sumOrders(erp),
    revenue: sumRevenue(erp),
    lastPurchase: lastPurchaseDate(erp),
    outstanding: sumOutstanding(erp),
    health: erp.health,
  };
}

export function getCustomerKpiSummary(customers: Customer[]) {
  let totalOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;
  let topCustomer = '';
  let topRevenue = 0;
  const activeCount = customers.filter((c) => c.status === 'active').length;

  for (const customer of customers) {
    const erp = getCustomerErpData(customer.name);
    if (!erp) continue;
    const rev = sumRevenue(erp);
    totalRevenue += rev;
    totalOrders += erp.orders.length;
    pendingOrders += erp.orders.filter(
      (o) => o.status === 'Processing' || o.status === 'Pending'
    ).length;
    if (rev > topRevenue) {
      topRevenue = rev;
      topCustomer = customer.name;
    }
  }

  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return {
    totalCustomers: customers.length,
    activeCustomers: activeCount,
    pendingOrders,
    revenueThisMonth: totalRevenue,
    avgOrderValue,
    topCustomer,
  };
}

export function getVendorTableRow(vendor: Vendor) {
  const erp = getVendorErpData(vendor.name);
  if (!erp) {
    return {
      materials: 0,
      pendingPO: 0,
      totalSpend: 0,
      lastDelivery: null as string | null,
      performance: 'Average' as const,
    };
  }
  return {
    materials: erp.materials.length,
    pendingPO: erp.purchaseOrders.filter((po) => po.status === 'Pending').length,
    totalSpend: erp.purchaseOrders.reduce((sum, po) => sum + po.amount, 0),
    lastDelivery: erp.deliveries.length
      ? erp.deliveries.sort((a, b) => b.date.localeCompare(a.date))[0].date
      : null,
    performance: erp.performance,
  };
}

export function getVendorKpiSummary(vendors: Vendor[]) {
  let totalSpend = 0;
  let pendingDeliveries = 0;
  let openPOs = 0;
  let topVendor = '';
  let topSpend = 0;
  const activeCount = vendors.filter((v) => v.status === 'active').length;

  for (const vendor of vendors) {
    const erp = getVendorErpData(vendor.name);
    if (!erp) continue;
    const spend = erp.purchaseOrders.reduce((sum, po) => sum + po.amount, 0);
    totalSpend += spend;
    openPOs += erp.purchaseOrders.filter((po) => po.status === 'Pending').length;
    pendingDeliveries += erp.deliveries.filter(
      (d) => d.status === 'In Transit' || d.status === 'Delayed'
    ).length;
    if (spend > topSpend) {
      topSpend = spend;
      topVendor = vendor.name;
    }
  }

  return {
    totalVendors: vendors.length,
    activeVendors: activeCount,
    pendingDeliveries,
    openPOs,
    monthlySpend: totalSpend,
    topVendor,
  };
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString()}`;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date('2026-05-26');
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
