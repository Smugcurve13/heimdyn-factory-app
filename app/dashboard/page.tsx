'use client';

import { formatUsd } from '@/lib/erp/selectors';
import { useErpStore } from '@/lib/erp/store';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
}

function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface Segment {
  label: string;
  value: number;
  bar: string;
  dot: string;
}

function PipelineBar({ title, total, segments }: { title: string; total: number; segments: Segment[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="font-mono text-xs text-muted-foreground">{total} total</span>
      </div>
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) =>
          s.value > 0 ? (
            <div key={s.label} className={s.bar} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value}`} />
          ) : null,
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="font-mono text-xs text-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stage → colour, aligned to the status palette in DESIGN.md §4.
const NEUTRAL = { bar: 'bg-muted-foreground/40', dot: 'bg-muted-foreground/60' };
const AMBER = { bar: 'bg-amber-400', dot: 'bg-amber-400' };
const YELLOW = { bar: 'bg-yellow-400', dot: 'bg-yellow-400' };
const BLUE = { bar: 'bg-blue-400', dot: 'bg-blue-400' };
const GREEN = { bar: 'bg-emerald-400', dot: 'bg-emerald-400' };

const countBy = <T,>(items: T[], key: (i: T) => string) =>
  items.reduce<Record<string, number>>((acc, i) => {
    const k = key(i);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

// Seeded, realistic activity feed (static — live logging is Phase 3).
const ACTIVITY: { when: string; text: string; dot: string }[] = [
  { when: '2h ago', text: 'PO-4001 goods received from Cascade Hardwoods', dot: 'bg-emerald-400' },
  { when: '5h ago', text: 'MO-3003 moved to In Progress', dot: 'bg-blue-400' },
  { when: 'Yesterday', text: 'Quotation QT-1004 approved — manufacturing required', dot: 'bg-amber-400' },
  { when: 'Yesterday', text: 'SO-2003 dispatched to Northgate Retail', dot: 'bg-emerald-400' },
  { when: '2 days ago', text: 'PO-4005 raised for Pine Stringer 2×4×48', dot: 'bg-amber-400' },
  { when: '3 days ago', text: 'SO-2001 invoiced — Cascade Freight Co.', dot: 'bg-emerald-400' },
];

export default function DashboardPage() {
  const { products, quotations, salesOrders, manufacturingOrders, purchaseOrders } = useErpStore();

  const openQuotations = quotations.filter((q) => q.stage !== 'Sales Order Raised').length;
  const requiresMo = quotations.filter((q) => q.stockShort && q.stage !== 'Sales Order Raised').length;
  const openSalesOrders = salesOrders.filter((s) => s.stage !== 'Invoiced').length;
  const activeManufacturing = manufacturingOrders.filter((m) => m.stage !== 'Done').length;
  const openPOs = purchaseOrders.filter((p) => p.stage !== 'Goods Received');
  const pendingPurchaseValue = openPOs.reduce((s, p) => s + p.valueUsd, 0);
  const finishedGoodsUnits = products.reduce((s, p) => s + p.finishedStock, 0);

  const q = countBy(quotations, (x) => x.stage);
  const so = countBy(salesOrders, (x) => x.stage);
  const mo = countBy(manufacturingOrders, (x) => x.stage);
  const po = countBy(purchaseOrders, (x) => x.stage);
  const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Heimdyn ERP — live figures from the current session. Surrey, BC · USD.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Open Quotations" value={String(openQuotations)} hint={`${requiresMo} require manufacturing`} />
        <KpiCard label="Open Sales Orders" value={String(openSalesOrders)} />
        <KpiCard label="Active Manufacturing" value={String(activeManufacturing)} />
        <KpiCard label="Open Purchase Orders" value={String(openPOs.length)} hint={`${formatUsd(pendingPurchaseValue)} pending`} />
        <KpiCard label="Finished Goods" value={finishedGoodsUnits.toLocaleString('en-US')} hint="units in stock" />
        <KpiCard label="Pending PO Value" value={formatUsd(pendingPurchaseValue)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Pipelines</h2>
          <PipelineBar
            title="Quotations"
            total={sum(q)}
            segments={[
              { label: 'Draft', value: q['Draft'] ?? 0, ...NEUTRAL },
              { label: 'Pending Approval', value: q['Pending Approval'] ?? 0, ...AMBER },
              { label: 'Proforma Invoice', value: q['Proforma Invoice'] ?? 0, ...BLUE },
              { label: 'Sales Order Raised', value: q['Sales Order Raised'] ?? 0, ...GREEN },
            ]}
          />
          <PipelineBar
            title="Sales Orders"
            total={sum(so)}
            segments={[
              { label: 'Confirmed', value: so['Confirmed'] ?? 0, ...BLUE },
              { label: 'Stock Committed', value: so['Stock Committed'] ?? 0, ...BLUE },
              { label: 'Dispatched', value: so['Dispatched'] ?? 0, ...BLUE },
              { label: 'Invoiced', value: so['Invoiced'] ?? 0, ...GREEN },
            ]}
          />
          <PipelineBar
            title="Manufacturing Orders"
            total={sum(mo)}
            segments={[
              { label: 'Pending Approval', value: mo['Pending Approval'] ?? 0, ...AMBER },
              { label: 'Planned', value: mo['Planned'] ?? 0, ...YELLOW },
              { label: 'In Progress', value: mo['In Progress'] ?? 0, ...BLUE },
              { label: 'Done', value: mo['Done'] ?? 0, ...GREEN },
            ]}
          />
          <PipelineBar
            title="Purchase Orders"
            total={sum(po)}
            segments={[
              { label: 'Pending Approval', value: po['Pending Approval'] ?? 0, ...AMBER },
              { label: 'Approved', value: po['Approved'] ?? 0, ...BLUE },
              { label: 'Goods Received', value: po['Goods Received'] ?? 0, ...GREEN },
            ]}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Recent Activity</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <ul className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                  <div>
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
