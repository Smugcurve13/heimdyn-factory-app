'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CalendarDays, ChevronDown, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

// ── types ──────────────────────────────────────────────────────────────────
type ViewMode = 'monthly' | 'daily';
interface PickerOption { label: string; value: string }
interface Summary     { total_units: number; distributors: number; bills: number }
interface LabelValue  { label: string; value: number }
interface ProductMix  { product_lines: LabelValue[]; components: LabelValue[] }
interface OrderRow    { distributor: string; total_units: number; num_orders: number; avg_per_order: number }
interface InactiveRow { distributor: string; last_label: string; days_since: number | null }

// ── constants ─────────────────────────────────────────────────────────────
const BLUE   = '#3b82f6';
const TEAL   = '#14b8a6';
const AMBER  = '#f59e0b';

const BASE_THEME: Partial<Options> = {
  chart: { backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
  title: { text: undefined },
  subtitle: { text: undefined },
  credits: { enabled: false },
  legend: { itemStyle: { color: 'hsl(var(--foreground))', fontWeight: '500', fontSize: '13px' }, itemHoverStyle: { color: 'hsl(var(--foreground))' } },
  xAxis: { labels: { style: { color: 'hsl(var(--foreground))', fontSize: '12px' } }, lineColor: 'transparent', tickColor: 'transparent', gridLineWidth: 0 },
  yAxis: { labels: { style: { color: 'hsl(var(--foreground))', fontSize: '12px' } }, gridLineWidth: 0, title: { text: null } },
  tooltip: {
    backgroundColor: 'hsl(var(--popover))',
    borderColor: 'hsl(var(--border))',
    borderRadius: 8,
    style: { color: 'hsl(var(--popover-foreground))', fontSize: '13px' },
    shadow: { color: '#000', opacity: 0.3, offsetX: 0, offsetY: 4, width: 12 },
  },
};

// ── mode toggle ────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {(['monthly', 'daily'] as ViewMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-xl px-3.5 py-1.5 font-medium capitalize transition-all ${
            mode === m
              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {m === 'monthly' ? 'Monthly' : 'Daily'}
        </button>
      ))}
    </div>
  );
}

// ── picker dropdown ────────────────────────────────────────────────────────
function Picker({ options, selected, onChange, placeholder = 'Select…' }: {
  options: PickerOption[]; selected: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = options.find((o) => o.value === selected)?.label ?? placeholder;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-48 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform dark:text-slate-500 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-64 w-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                o.value === selected ? 'font-semibold text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {o.label}
              {o.value === selected && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── metric card ───────────────────────────────────────────────────────────
function MetricCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm px-6 py-5 flex flex-col gap-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold mt-1">{loading ? '—' : value}</span>
    </div>
  );
}

// ── horizontal bar panel ──────────────────────────────────────────────────
function HBarPanel({
  title, subtitle, data, color, loading, limit = 999,
}: {
  title: string; subtitle: string; data: LabelValue[];
  color: string; loading: boolean; limit?: number;
}) {
  const [Highcharts, setHighcharts] = useState<any>(null);

  useEffect(() => {
    import('highcharts').then((hc) => setHighcharts(hc.default ?? hc));
  }, []);

  const rows   = data.slice(0, limit);
  const rowH   = 36;
  const chartH = Math.max(rows.length * rowH, 160);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  const rgb = hexToRgb(color);

  const options: Options = {
    ...BASE_THEME,
    chart: { ...(BASE_THEME.chart as any), type: 'bar', height: chartH, marginRight: 24, marginTop: 8, marginBottom: 8 },
    xAxis: {
      ...(BASE_THEME.xAxis as any),
      categories: rows.map((d) => d.label),
      labels: { style: { color: 'hsl(var(--foreground))', fontSize: '12px' } },
    },
    yAxis: {
      ...(BASE_THEME.yAxis as any),
      labels: {
        style: { color: 'hsl(var(--foreground))', fontSize: '12px' },
        formatter() { return (this.value as number) >= 1000 ? `${((this.value as number)/1000).toFixed(0)}k` : String(this.value); },
      },
    },
    series: [{
      type: 'bar',
      name: 'Units',
      data: rows.map((row, i) => ({
        y: row.value,
        name: row.label,
        color: `rgba(${rgb.r},${rgb.g},${rgb.b},${1 - i * (0.5 / Math.max(rows.length - 1, 1))})`,
      })),
      borderRadius: 3,
      pointWidth: 16,
    }] as any,
    legend: { enabled: false },
    plotOptions: { bar: { groupPadding: 0.1 } },
  };

  return (
    <div className="flex flex-col h-full">
      <p className="text-sm font-bold mb-0.5">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
      {loading ? (
        <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground" style={{ minHeight: 160 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground" style={{ minHeight: 160 }}>No data for selected period</div>
      ) : !Highcharts ? (
        <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground" style={{ minHeight: 160 }}>Loading…</div>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────
export default function SalesPage() {
  const [mode,          setMode]          = useState<ViewMode>('monthly');
  const [monthOptions,  setMonthOptions]  = useState<PickerOption[]>([]);
  const [dayOptions,    setDayOptions]    = useState<PickerOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay,   setSelectedDay]   = useState('');

  const [summary,   setSummary]   = useState<Summary | null>(null);
  const [distributors, setDistributors] = useState<LabelValue[]>([]);
  const [mix,          setMix]         = useState<ProductMix>({ product_lines: [], components: [] });
  const [orders,    setOrders]    = useState<OrderRow[]>([]);
  const [inactive,  setInactive]  = useState<InactiveRow[]>([]);

  const [loadingSum,      setLoadingSum]      = useState(true);
  const [loadingDistributors, setLoadingDistributors] = useState(true);
  const [loadingMix,      setLoadingMix]      = useState(true);
  const [loadingOrders,   setLoadingOrders]   = useState(true);
  const [loadingInactive, setLoadingInactive] = useState(true);

  // Load available months + days once
  useEffect(() => {
    Promise.all([
      fetch('/api/sales/available-months').then((r) => r.json()),
      fetch('/api/sales/available-days').then((r) => r.json()),
    ]).then(([months, days]: [PickerOption[], PickerOption[]]) => {
      setMonthOptions(months);
      setDayOptions(days);
      if (months.length > 0) setSelectedMonth(months[0].value);
      if (days.length   > 0) setSelectedDay(days[0].value);
    }).catch(() => {});

    // Inactive distributors don't change with mode — load once
    fetch('/api/sales/inactive-dealers')
      .then((r) => r.json()).then(setInactive).finally(() => setLoadingInactive(false));
  }, []);

  const activeSelector = mode === 'monthly' ? selectedMonth : selectedDay;

  // Fetch filtered data when mode or selection changes
  useEffect(() => {
    if (!activeSelector) return;
    let cancelled = false;

    const qs = mode === 'daily'
      ? `?day=${activeSelector}`
      : `?month=${activeSelector}`;

    setLoadingSum(true);
    setLoadingDistributors(true);
    setLoadingMix(true);
    setLoadingOrders(true);

    Promise.all([
      fetch(`/api/sales/summary${qs}`).then((r) => r.json()),
      fetch(`/api/sales/top-dealers${qs}`).then((r) => r.json()),
      fetch(`/api/sales/product-mix${qs}`).then((r) => r.json()),
      fetch(`/api/sales/order-size${qs}`).then((r) => r.json()),
    ]).then(([s, d, m, o]) => {
      if (cancelled) return;
      setSummary(s);
      setDistributors(d);
      setMix(m);
      setOrders(o);
    }).catch(() => {}).finally(() => {
      if (!cancelled) {
        setLoadingSum(false);
        setLoadingDistributors(false);
        setLoadingMix(false);
        setLoadingOrders(false);
      }
    });

    return () => { cancelled = true; };
  }, [mode, activeSelector]);

  const distributorH  = Math.max(distributors.length * 36, 200);
  const criticalCount = inactive.filter((d) => (d.days_since ?? 999) > 60).length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Delivery volumes, distributor performance, and order analytics — {mode === 'daily' ? 'daily' : 'monthly'} view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} onChange={setMode} />
          <Picker
            options={mode === 'monthly' ? monthOptions : dayOptions}
            selected={mode === 'monthly' ? selectedMonth : selectedDay}
            onChange={mode === 'monthly' ? setSelectedMonth : setSelectedDay}
            placeholder={mode === 'monthly' ? 'Select month…' : 'Select day…'}
          />
        </div>
      </div>

      {/* ── Top 3 metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Units Delivered"
          value={(summary?.total_units ?? 0).toLocaleString()}
          loading={loadingSum}
        />
        <MetricCard
          label="Unique Distributors Served"
          value={(summary?.distributors ?? 0).toLocaleString()}
          loading={loadingSum}
        />
        <MetricCard
          label="Bills Raised"
          value={(summary?.bills ?? 0).toLocaleString()}
          loading={loadingSum}
        />
      </div>

      {/* ── Panel 1 — Top 10 distributors ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        {loadingDistributors ? (
          <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div style={{ height: distributorH + 48 }}>
            <HBarPanel
              title="Top 10 Distributors by Units"
              subtitle="Total units delivered — sorted highest to lowest"
              data={distributors}
              color={BLUE}
              loading={false}
            />
          </div>
        )}
      </div>

      {/* ── Panel 2 — Product mix: product lines + components side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <HBarPanel
            title="Best Selling Product Lines"
            subtitle="Total units delivered per product line"
            data={mix.product_lines}
            color={TEAL}
            loading={loadingMix}
          />
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <HBarPanel
            title="Best Selling Components"
            subtitle="Total units delivered per component"
            data={mix.components}
            color={AMBER}
            loading={loadingMix}
          />
        </div>
      </div>

      {/* ── Panel 3 — Average order size table ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <p className="text-sm font-bold mb-0.5">Average Order Size per Distributor</p>
        <p className="text-xs text-muted-foreground mb-5">
          Sorted by average units per order — descending
        </p>
        {loadingOrders ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">No data for selected period</div>
        ) : (
          <div className="overflow-auto max-h-80">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['#', 'Distributor', 'Total Units', 'Orders', 'Avg / Order'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2 pr-5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((row, i) => (
                  <tr key={row.distributor} className={`border-b border-border/40 ${i % 2 === 1 ? 'bg-muted/25' : ''}`}>
                    <td className="py-2 pr-5 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="py-2 pr-5 font-medium max-w-[200px] truncate">{row.distributor}</td>
                    <td className="py-2 pr-5 tabular-nums">{row.total_units.toLocaleString()}</td>
                    <td className="py-2 pr-5 tabular-nums">{row.num_orders}</td>
                    <td className="py-2 font-semibold tabular-nums">{row.avg_per_order.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Panel 4 — Inactive distributor alert (always all-time) ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-sm font-bold mb-0.5">Inactive Distributor Alert</p>
            <p className="text-xs text-muted-foreground">
              Distributors with no delivery in the last 30 days (relative to the most recent delivery date)
            </p>
          </div>
          {!loadingInactive && (
            <div className="flex gap-2 flex-wrap">
              {criticalCount > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                  {criticalCount} over 60 days
                </span>
              )}
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {inactive.length} inactive total
              </span>
            </div>
          )}
        </div>

        {loadingInactive ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Loading…</div>
        ) : inactive.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
            All distributors have ordered within the last 30 days.
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['Distributor', 'Last Order', 'Days Inactive', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2 pr-5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inactive.map((row, i) => {
                  const critical = (row.days_since ?? 999) > 60;
                  const warning  = !critical && (row.days_since ?? 0) > 30;
                  return (
                    <tr
                      key={row.distributor}
                      className={`border-b border-border/40 ${
                        critical ? 'bg-red-500/5'
                        : warning  ? 'bg-amber-500/5'
                        : i % 2 === 1 ? 'bg-muted/25' : ''
                      }`}
                    >
                      <td className="py-2.5 pr-5 font-medium max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          {critical && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                          {warning  && <Clock         className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                          {row.distributor}
                        </div>
                      </td>
                      <td className="py-2.5 pr-5 text-muted-foreground tabular-nums">{row.last_label}</td>
                      <td className={`py-2.5 pr-5 font-semibold tabular-nums ${
                        critical ? 'text-red-500' : warning ? 'text-amber-500' : ''
                      }`}>
                        {row.days_since !== null ? `${row.days_since}d` : '—'}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          critical
                            ? 'bg-red-500/15 text-red-500'
                            : warning
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {critical ? 'Critical' : warning ? 'Warning' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
