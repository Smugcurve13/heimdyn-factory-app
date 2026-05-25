'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';
import {
  Activity,
  Boxes,
  CalendarDays,
  ChevronDown,
  Package,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

type ViewMode = 'monthly' | 'daily';

interface DemoOverview {
  latestMonth: string;
  materialMonth: string;
  produced: number;
  prevProduced: number;
  delivered: number;
  prevDelivered: number;
  monthGap: number;
  stockGap: number;
  materialPurchased: number;
  materialConsumed: number;
  materialStock: number;
}

interface MonthlyTrendRow  { month: string; produced: number; delivered: number; }
interface ComponentShareRow { month: string; label: string;  value: number; }
interface PickerOption     { label: string; value: string; }
interface SalesRepRow      { sales_rep: string; total_units: number; }

// ─── Shared styles ────────────────────────────────────────────────────────────

const cardShell =
  'rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_14px_40px_rgba(2,6,23,0.08)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:shadow-[0_14px_40px_rgba(2,6,23,0.18)]';

const innerPanel =
  'rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900';

const toneClasses: Record<string, string> = {
  up:      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  down:    'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  neutral: 'bg-slate-200 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200',
};

// ─── Highcharts base theme ────────────────────────────────────────────────────

const BASE_THEME: Partial<Options> = {
  chart:    { backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
  title:    { text: undefined },
  subtitle: { text: undefined },
  credits:  { enabled: false },
  legend: {
    itemStyle:      { color: '#CBD5E1', fontWeight: '500', fontSize: '12px' },
    itemHoverStyle: { color: '#F8FAFC' },
  },
  xAxis: {
    labels:       { style: { color: '#94A3B8', fontSize: '11px' } },
    lineColor:    'rgba(148, 163, 184, 0.16)',
    tickColor:    'transparent',
    gridLineWidth: 0,
  },
  yAxis: {
    labels:        { style: { color: '#94A3B8', fontSize: '11px' } },
    gridLineColor: 'rgba(148, 163, 184, 0.1)',
    title:         { text: null },
  },
  tooltip: {
    backgroundColor: '#0F172A',
    borderColor:     'rgba(148, 163, 184, 0.25)',
    borderRadius:    12,
    style:           { color: '#F8FAFC', fontSize: '13px' },
    shadow:          { color: '#020617', opacity: 0.35, offsetX: 0, offsetY: 8, width: 18 },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtInt = (n: number) => n.toLocaleString();

const changeMeta = (current: number, previous: number) => {
  if (!previous) return { tone: 'neutral', label: 'vs previous', value: 'New' };
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  return {
    tone:  delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
    label: 'vs previous',
    value: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`,
  };
};

// ─── Generic Picker dropdown ──────────────────────────────────────────────────

function Picker({
  options,
  selected,
  onChange,
  placeholder = 'Select…',
}: {
  options: PickerOption[];
  selected: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
                o.value === selected
                  ? 'font-semibold text-sky-600 dark:text-sky-400'
                  : 'text-slate-700 dark:text-slate-300'
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

// ─── Mode toggle pill ─────────────────────────────────────────────────────────

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

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ title, value, subline, chip, icon }: {
  title:   string;
  value:   string;
  subline: string;
  chip:    { value: string; tone: string; label: string };
  icon:    React.ReactNode;
}) {
  return (
    <div className={`${cardShell} p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</p>
          <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`${innerPanel} p-3 text-slate-600 dark:text-slate-100`}>{icon}</div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-1 font-semibold ${toneClasses[chip.tone]}`}>{chip.value}</span>
        <span className="text-slate-500 dark:text-slate-400">{chip.label}</span>
      </div>
      <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-3">
        <p className="text-xs text-slate-400 dark:text-slate-500">{subline}</p>
      </div>
    </div>
  );
}

// ─── Snapshot Card ───────────────────────────────────────────────────────────

function SnapshotCard({ mode, overview, deliveredChange, prevLabel }: {
  mode: ViewMode;
  overview: DemoOverview | null;
  deliveredChange: ReturnType<typeof changeMeta> | null;
  prevLabel: string;
}) {
  return (
    <div className={`${cardShell} p-6`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {mode === 'daily' ? 'Daily Snapshot' : 'Monthly Snapshot'}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Live operational rollups for the selected {mode === 'daily' ? 'day' : 'month'}.
          </p>
        </div>
        <div className={`${innerPanel} p-3 text-slate-600 dark:text-slate-200`}>
          <Activity className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[0.78fr_1fr_1fr_1fr]">
        <div className={`${innerPanel} p-4`}>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Selected {mode === 'daily' ? 'day' : 'month'}
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            {overview?.latestMonth ?? 'Loading...'}
          </p>
        </div>
        <div className={`${innerPanel} p-4`}>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Truck className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
            <span className="text-sm">Delivered</span>
          </div>
          <p className="mt-2.5 text-2xl font-semibold text-slate-900 dark:text-white">
            {overview ? fmtInt(overview.delivered) : '...'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {deliveredChange ? `${deliveredChange.value} ${prevLabel}` : prevLabel}
          </p>
        </div>
        <div className={`${innerPanel} p-4`}>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            {overview && overview.monthGap >= 0
              ? <TrendingUp   className="h-4 w-4 text-sky-500 dark:text-sky-300" />
              : <TrendingDown className="h-4 w-4 text-amber-500 dark:text-amber-300" />}
            <span className="text-sm">Period gap</span>
          </div>
          <p className="mt-2.5 text-2xl font-semibold text-slate-900 dark:text-white">
            {overview ? `${overview.monthGap >= 0 ? '+' : ''}${fmtInt(overview.monthGap)}` : '...'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Produced minus delivered in selected period</p>
        </div>
        <div className={`${innerPanel} p-4`}>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Package className="h-4 w-4 text-violet-500 dark:text-violet-300" />
            <span className="text-sm">Cumulative stock gap</span>
          </div>
          <p className="mt-2.5 text-2xl font-semibold text-slate-900 dark:text-white">
            {overview ? `${overview.stockGap >= 0 ? '+' : ''}${fmtInt(overview.stockGap)}` : '...'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total produced minus delivered up to selected date</p>
        </div>
      </div>
    </div>
  );
}

// ─── Sales by Sales Rep Card ─────────────────────────────────────────────────

const PERSON_COLORS = [
  'bg-sky-400',
  'bg-violet-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-indigo-400',
  'bg-teal-400',
];

const PERSON_BAR_COLORS = [
  'bg-sky-400/70',
  'bg-violet-400/70',
  'bg-emerald-400/70',
  'bg-amber-400/70',
  'bg-rose-400/70',
  'bg-indigo-400/70',
  'bg-teal-400/70',
];

function SalesByPersonCard({ rows, mode, loading, periodLabel }: {
  rows:        SalesRepRow[];
  mode:        ViewMode;
  loading:     boolean;
  periodLabel: string;
}) {
  const total = rows.reduce((s, r) => s + r.total_units, 0);

  return (
    <div className={`${cardShell} p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Sales by Sales Rep</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Units delivered per sales rep for the selected {mode === 'daily' ? 'day' : 'month'}.
          </p>
        </div>
        <div className={`${innerPanel} p-3 text-slate-600 dark:text-slate-200`}>
          <Users className="h-5 w-5" />
        </div>
      </div>

      <div className={`mt-4 ${innerPanel} px-3 py-2 text-xs text-slate-600 dark:text-slate-300`}>
        Period: <span className="font-semibold text-slate-900 dark:text-white">{periodLabel || 'Loading...'}</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {loading ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Loading sales rep data...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            No delivery data for this period
          </div>
        ) : (
          rows.map((row, i) => {
            const share = total ? (row.total_units / total) * 100 : 0;
            return (
              <div key={row.sales_rep} className={`${innerPanel} px-4 py-3`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PERSON_COLORS[i % PERSON_COLORS.length]}`} />
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.sales_rep}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{fmtInt(row.total_units)}</span>
                    <span className="ml-1.5 text-[11px] text-slate-400 dark:text-slate-500">{share.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${PERSON_BAR_COLORS[i % PERSON_BAR_COLORS.length]}`}
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoDashboardPage() {
  const [mode, setMode] = useState<ViewMode>('monthly');

  const [monthOptions, setMonthOptions] = useState<PickerOption[]>([]);
  const [dayOptions,   setDayOptions]   = useState<PickerOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay,   setSelectedDay]   = useState('');

  const [overview,       setOverview]       = useState<DemoOverview | null>(null);
  const [monthlyTrend,   setMonthlyTrend]   = useState<MonthlyTrendRow[]>([]);
  const [topComponents,  setTopComponents]  = useState<ComponentShareRow[]>([]);
  const [salesByPerson,  setSalesByPerson]  = useState<SalesRepRow[]>([]);
  const [Highcharts,     setHighcharts]     = useState<any>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  // Load Highcharts once
  useEffect(() => {
    import('highcharts').then((m) => setHighcharts(m.default ?? m));
  }, []);

  // Fetch available months + days once
  useEffect(() => {
    Promise.all([
      fetch('/api/main-dashboard/available-months').then((r) => r.json()),
      fetch('/api/main-dashboard/available-days').then((r) => r.json()),
    ]).then(([months, days]: [PickerOption[], PickerOption[]]) => {
      setMonthOptions(months);
      setDayOptions(days);
      if (months.length > 0) setSelectedMonth(months[0].value);
      if (days.length   > 0) setSelectedDay(days[0].value);
    }).catch(() => {});
  }, []);

  // The active selector value
  const activeSelector = mode === 'monthly' ? selectedMonth : selectedDay;

  // Fetch data whenever mode or active selection changes
  useEffect(() => {
    if (!activeSelector) return;

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const overviewQs = mode === 'daily'
          ? `?day=${activeSelector}`
          : `?month=${activeSelector}`;

        const chartQs = mode === 'daily'
          ? `?mode=daily&upTo=${activeSelector}`
          : `?mode=monthly&upTo=${activeSelector}`;

        const componentsQs = mode === 'daily'
          ? `?day=${activeSelector}`
          : `?month=${activeSelector}`;

        const salesQs = mode === 'daily'
          ? `?day=${activeSelector}`
          : `?month=${activeSelector}`;

        const [overviewRes, trendRes, componentsRes, salesRes] = await Promise.all([
          fetch(`/api/main-dashboard/overview${overviewQs}`),
          fetch(`/api/dashboard2/monthly-chart${chartQs}`),
          fetch(`/api/main-dashboard/top-blanks-latest${componentsQs}`),
          fetch(`/api/main-dashboard/sales-by-salesperson${salesQs}`),
        ]);

        if (!overviewRes.ok || !trendRes.ok || !componentsRes.ok || !salesRes.ok) throw new Error('Failed to load data');

        const [overviewJson, trendJson, componentsJson, salesJson] = await Promise.all([
          overviewRes.json() as Promise<DemoOverview>,
          trendRes.json()    as Promise<MonthlyTrendRow[]>,
          componentsRes.json() as Promise<ComponentShareRow[]>,
          salesRes.json()    as Promise<SalesRepRow[]>,
        ]);

        if (!cancelled) {
          setOverview(overviewJson);
          setMonthlyTrend(trendJson);
          setTopComponents(componentsJson);
          setSalesByPerson(salesJson);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [mode, activeSelector]);

  const producedChange  = overview ? changeMeta(overview.produced,  overview.prevProduced)  : null;
  const deliveredChange = overview ? changeMeta(overview.delivered, overview.prevDelivered) : null;
  const materialFlow    = overview ? overview.materialPurchased - overview.materialConsumed : 0;
  const stockGapTone    = overview ? (overview.stockGap >= 0 ? 'up' : 'down') : 'neutral';
  const prevLabel       = mode === 'daily' ? 'vs previous day' : 'vs previous month';

  const trendOptions: Options = useMemo(
    () => ({
      ...BASE_THEME,
      chart: { ...(BASE_THEME.chart as any), type: 'areaspline', height: 360, spacing: [8, 8, 8, 8] },
      legend: { ...BASE_THEME.legend, align: 'left', verticalAlign: 'top', symbolRadius: 999 },
      xAxis:  { ...(BASE_THEME.xAxis as any), categories: monthlyTrend.map((r) => r.month) },
      yAxis: {
        ...(BASE_THEME.yAxis as any),
        labels: {
          style: { color: '#94A3B8', fontSize: '11px' },
          formatter() {
            const v = this.value as number;
            return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);
          },
        },
      },
      plotOptions: {
        areaspline: { lineWidth: 3, marker: { enabled: true, radius: 3.5, symbol: 'circle' }, fillOpacity: 0.12 },
        series: { states: { hover: { halo: { size: 8 } } } },
      },
      series: [
        {
          type: 'areaspline', name: 'Units Produced',
          data: monthlyTrend.map((r) => r.produced),
          color: '#60A5FA',
          fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(96,165,250,0.32)'], [1, 'rgba(96,165,250,0.02)']] },
        },
        {
          type: 'areaspline', name: 'Units Delivered',
          data: monthlyTrend.map((r) => r.delivered),
          color: '#34D399',
          fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(52,211,153,0.24)'], [1, 'rgba(52,211,153,0.02)']] },
        },
      ],
      tooltip: {
        ...(BASE_THEME.tooltip as any),
        shared: true,
        pointFormatter(this: any) {
          return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${Number(this.y).toLocaleString()}</b><br/>`;
        },
      },
    }),
    [monthlyTrend],
  );

  const donutOptions: Options = useMemo(
    () => ({
      ...BASE_THEME,
      chart:  { ...(BASE_THEME.chart as any), type: 'pie', height: 250, spacing: [0, 0, 0, 0] },
      legend: { enabled: false },
      plotOptions: {
        pie: { innerSize: '70%', borderWidth: 0, dataLabels: { enabled: false }, states: { hover: { halo: { size: 5 } } } },
      },
      tooltip: {
        ...(BASE_THEME.tooltip as any),
        pointFormat: '<span style="color:{point.color}">●</span> {point.name}: <b>{point.y:,.0f}</b><br/>',
      },
      series: [{
        type: 'pie', name: 'Units',
        data: topComponents.map((row, i) => ({
          name: row.label, y: row.value,
          color: ['#60A5FA', '#A78BFA', '#34D399', '#FBBF24', '#F87171'][i % 5],
        })),
      }],
    }),
    [topComponents],
  );

  const componentTotal = topComponents.reduce((s, r) => s + r.value, 0);
  const chartTitle = mode === 'daily'
    ? '30-day view of factory output versus dispatched units, ending on the selected day.'
    : '12-month view of factory output versus dispatched units, ending on the selected month.';

  return (
    <div className="min-h-full bg-transparent p-6 text-slate-900 dark:text-slate-50">
      <div className="mx-auto w-full max-w-[1760px] space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Main Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A redesigned executive view using live production, delivery, and material insights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle mode={mode} onChange={(m) => setMode(m)} />
            <Picker
              key={mode}
              options={mode === 'monthly' ? monthOptions : dayOptions}
              selected={mode === 'monthly' ? selectedMonth : selectedDay}
              onChange={mode === 'monthly' ? setSelectedMonth : setSelectedDay}
              placeholder={mode === 'monthly' ? 'Select month…' : 'Select day…'}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200">
            {error}
          </div>
        )}

        {/* ── Snapshot (daily: above KPIs) ── */}
        {mode === 'daily' && (
          <SnapshotCard mode={mode} overview={overview} deliveredChange={deliveredChange} prevLabel={prevLabel} />
        )}

        {/* ── KPI Cards ── */}
        <div className="grid gap-6 xl:grid-cols-4">
          <SummaryCard
            title="Units Produced"
            value={overview ? fmtInt(overview.produced) : loading ? '...' : '—'}
            subline={overview ? `${overview.latestMonth} production total` : ''}
            chip={producedChange
              ? { ...producedChange, label: prevLabel }
              : { value: 'Live', tone: 'neutral', label: prevLabel }}
            icon={<Boxes className="h-5 w-5" />}
          />
          <SummaryCard
            title="Units Delivered"
            value={overview ? fmtInt(overview.delivered) : loading ? '...' : '—'}
            subline={overview ? `${overview.latestMonth} delivery total` : ''}
            chip={deliveredChange
              ? { ...deliveredChange, label: prevLabel }
              : { value: 'Live', tone: 'neutral', label: prevLabel }}
            icon={<Truck className="h-5 w-5" />}
          />
          <SummaryCard
            title={mode === 'daily' ? 'Daily Prod. / Del. Gap' : 'Production Delivery Gap'}
            value={overview ? `${overview.monthGap >= 0 ? '+' : ''}${fmtInt(overview.monthGap)}` : loading ? '...' : '—'}
            subline="Produced minus delivered in the selected period"
            chip={{
              value: overview ? `${overview.stockGap >= 0 ? '+' : ''}${fmtInt(overview.stockGap)}` : 'Live',
              tone: stockGapTone,
              label: 'cumulative stock gap',
            }}
            icon={overview && overview.monthGap >= 0
              ? <TrendingUp className="h-5 w-5" />
              : <TrendingDown className="h-5 w-5" />}
          />
          <SummaryCard
            title="Raw Material Stock"
            value={overview ? `${fmtInt(overview.materialStock)} kg` : loading ? '...' : '—'}
            subline={overview ? `${overview.materialMonth} material position` : ''}
            chip={{
              value: overview ? `${materialFlow >= 0 ? '+' : ''}${fmtInt(materialFlow)} kg` : 'Live',
              tone: overview ? (materialFlow >= 0 ? 'up' : 'down') : 'neutral',
              label: 'period inflow vs outflow',
            }}
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* ── Trend Chart ── */}
        <div className={`${cardShell} p-6`}>
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                Production &amp; Delivery {mode === 'daily' ? 'Trend (30 days)' : 'Growth (12 months)'}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{chartTitle}</p>
            </div>
            {overview && (
              <div className="grid gap-2 text-right text-xs text-slate-500 dark:text-slate-400">
                <span>Produced: <span className="font-semibold text-sky-500 dark:text-sky-300">{fmtInt(overview.produced)}</span></span>
                <span>Delivered: <span className="font-semibold text-emerald-600 dark:text-emerald-300">{fmtInt(overview.delivered)}</span></span>
              </div>
            )}
          </div>
          <div className="mt-6">
            {!Highcharts || loading ? (
              <div className="flex h-[360px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Loading trend...
              </div>
            ) : (
              <HighchartsReact highcharts={Highcharts} options={trendOptions} />
            )}
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="space-y-5">
          {/* Snapshot (monthly: in bottom section) */}
          {mode === 'monthly' && (
            <SnapshotCard mode={mode} overview={overview} deliveredChange={deliveredChange} prevLabel={prevLabel} />
          )}

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.92fr]">
            <SalesByPersonCard
              rows={salesByPerson}
              mode={mode}
              loading={loading}
              periodLabel={overview?.latestMonth ?? ''}
            />

            <div className={`${cardShell} p-6`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Top 5 Components</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Component mix for the selected {mode === 'daily' ? 'day' : 'month'}.
                  </p>
                </div>
                <div className={`${innerPanel} p-3 text-slate-600 dark:text-slate-200`}>
                  <Package className="h-5 w-5" />
                </div>
              </div>

              <div className={`mt-4 ${innerPanel} px-3 py-2 text-xs text-slate-600 dark:text-slate-300`}>
                Period: <span className="font-semibold text-slate-900 dark:text-white">
                  {topComponents[0]?.month ?? overview?.latestMonth ?? 'Loading...'}
                </span>
              </div>

              <div className="mt-4">
                {!Highcharts || loading ? (
                  <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    {topComponents.length === 0 && !loading ? 'No delivery data for this period' : 'Loading components mix...'}
                  </div>
                ) : topComponents.length === 0 ? (
                  <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    No delivery data for this period
                  </div>
                ) : (
                  <HighchartsReact highcharts={Highcharts} options={donutOptions} />
                )}
              </div>

              <div className="mt-2 space-y-2">
                {topComponents.map((row, index) => {
                  const colors = ['bg-sky-400', 'bg-violet-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'];
                  const share = componentTotal ? (row.value / componentTotal) * 100 : 0;
                  return (
                    <div key={row.label} className={`flex items-center justify-between ${innerPanel} px-3 py-2`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{row.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtInt(row.value)}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{share.toFixed(1)}% share</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
