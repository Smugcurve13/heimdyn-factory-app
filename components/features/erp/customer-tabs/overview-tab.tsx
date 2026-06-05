'use client';

import type { Customer, CustomerErpData } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import { HealthBadge } from '@/components/features/erp/health-badge';

export function CustomerOverviewTab({ customer, erp }: { customer: Customer; erp: CustomerErpData | null }) {
  const revenue = erp ? erp.orders.reduce((s, o) => s + o.amount, 0) : 0;
  const outstanding = erp
    ? erp.invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
    : 0;
  const avgOrderValue = erp && erp.orders.length ? Math.round(revenue / erp.orders.length) : 0;
  const productCount = erp ? erp.products.length : 0;
  const firstOrder = erp?.orders.length
    ? erp.orders.sort((a, b) => a.date.localeCompare(b.date))[0].date
    : null;
  const lastOrder = erp?.orders.length
    ? erp.orders.sort((a, b) => b.date.localeCompare(a.date))[0].date
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Basic Information</h3>
        <dl className="space-y-3 text-sm">
          <Field label="Company Name" value={customer.name} />
          <Field label="Contact Person" value={customer.contact_person} />
          <Field label="Email" value={customer.email} />
          <Field label="Phone" value={customer.phone} />
          <Field label="GST Number" value="—" />
          <Field label="PAN" value="—" />
          <Field label="Address" value={customer.address} />
          <Field label="City" value={customer.city} />
          <Field label="State" value={customer.state} />
        </dl>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Financial Summary</h3>
        <dl className="space-y-3 text-sm">
          <Field label="Total Revenue" value={formatCurrency(revenue)} />
          <Field label="Outstanding Amount" value={formatCurrency(outstanding)} />
          <Field label="Average Order Value" value={formatCurrency(avgOrderValue)} />
          <Field label="Credit Limit" value={erp ? formatCurrency(erp.creditLimit) : '—'} />
          <Field label="Payment Terms" value={erp?.paymentTerms ?? '—'} />
          <Field
            label="Last Payment Date"
            value={
              erp?.payments.length
                ? formatDate(erp.payments.sort((a, b) => b.date.localeCompare(a.date))[0].date)
                : '—'
            }
          />
        </dl>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Stats</h3>
        <dl className="space-y-3 text-sm">
          <Field label="First Order Date" value={firstOrder ? formatDate(firstOrder) : '—'} />
          <Field label="Last Order Date" value={lastOrder ? formatDate(lastOrder) : '—'} />
          <Field label="Products Purchased" value={String(productCount)} />
          <Field label="Total Orders" value={erp ? String(erp.orders.length) : '0'} />
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Customer Health</dt>
            <dd className="mt-1">{erp ? <HealthBadge value={erp.health} /> : '—'}</dd>
          </div>
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
