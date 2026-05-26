'use client';

import type { Vendor, VendorErpData } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/mock-data';

export function VendorOverviewTab({ vendor, erp }: { vendor: Vendor; erp: VendorErpData | null }) {
  const totalSpend = erp ? erp.purchaseOrders.reduce((s, po) => s + po.amount, 0) : 0;
  const pendingPayments = erp
    ? erp.invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
    : 0;
  const avgOrderValue = erp && erp.purchaseOrders.length
    ? Math.round(totalSpend / erp.purchaseOrders.length)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Basic Information</h3>
        <dl className="space-y-3 text-sm">
          <Field label="Company Name" value={vendor.name} />
          <Field label="Contact Person" value={vendor.contact_person} />
          <Field label="Email" value={vendor.email} />
          <Field label="Phone" value={vendor.phone} />
          <Field label="GST Number" value="—" />
          <Field label="Address" value={vendor.address} />
          <Field label="City" value={vendor.city} />
          <Field label="State" value={vendor.state} />
        </dl>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Financial Summary</h3>
        <dl className="space-y-3 text-sm">
          <Field label="Total Spend" value={formatCurrency(totalSpend)} />
          <Field label="Pending Payments" value={formatCurrency(pendingPayments)} />
          <Field label="Average Order Value" value={formatCurrency(avgOrderValue)} />
          <Field label="Payment Terms" value={erp?.paymentTerms ?? '—'} />
          <Field label="Vendor Since" value={erp ? formatDate(erp.vendorSince) : '—'} />
          <Field label="Total POs" value={erp ? String(erp.purchaseOrders.length) : '0'} />
        </dl>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{value || '—'}</dd>
    </div>
  );
}
