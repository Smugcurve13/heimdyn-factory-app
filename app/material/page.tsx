'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, Pencil, Check, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

// ── types ─────────────────────────────────────────────────────────────────
type ViewMode = 'monthly' | 'daily';
interface PickerOption { label: string; value: string }
interface Summary   { purchased: number; consumed: number; stock: number }
interface MonthRow  { month: string; purchased: number; consumed: number }
interface ComponentRow { label: string; value: number }

// ── constants ─────────────────────────────────────────────────────────────
const PURPLE = '#8b5cf6';
const CORAL  = '#f97316';
const KFMT   = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}k`
  : String(v);

const THRESHOLD_KEY = 'material_stock_threshold';
const DEFAULT_THRESHOLD = 500;

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

// ── editable threshold ────────────────────────────────────────────────────
function ThresholdEditor({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n >= 0) onChange(n);
    else setDraft(String(value));
    setEditing(false);
  };

  return editing ? (
    <span className="inline-flex items-center gap-1">
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-24 rounded border bg-background px-2 py-0.5 text-sm font-semibold"
        type="number"
        min={0}
      />
      <button onClick={commit} className="text-emerald-500 hover:text-emerald-400"><Check className="h-4 w-4" /></button>
      <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
    </span>
  ) : (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="inline-flex items-center gap-1 font-semibold hover:underline underline-offset-2"
    >
      {value.toLocaleString()} kg
      <Pencil className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

// ── page ──────────────────────────────────────────────────────────────────
export default function MaterialPage() {
  const [mode,          setMode]          = useState<ViewMode>('monthly');
  const [monthOptions,  setMonthOptions]  = useState<PickerOption[]>([]);
  const [dayOptions,    setDayOptions]    = useState<PickerOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay,   setSelectedDay]   = useState('');

  const [summary,   setSummary]   = useState<Summary | null>(null);
  const [trend,     setTrend]     = useState<MonthRow[]>([]);
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const [loading,       setLoading]       = useState(true);
  const [loadingTrend,  setLoadingTrend]  = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(true);

  const [Highcharts, setHighcharts] = useState<any>(null);

  useEffect(() => {
    import('highcharts').then((hc) => setHighcharts(hc.default ?? hc));
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THRESHOLD_KEY);
      if (saved !== null) setThreshold(Number(saved));
    } catch {}
  }, []);

  const updateThreshold = (v: number) => {
    setThreshold(v);
    try { localStorage.setItem(THRESHOLD_KEY, String(v)); } catch {}
  };

  // Load available months + days once
  useEffect(() => {
    Promise.all([
      fetch('/api/material/available-months').then((r) => r.json()),
      fetch('/api/material/available-days').then((r) => r.json()),
    ]).then(([months, days]: [PickerOption[], PickerOption[]]) => {
      setMonthOptions(months);
      setDayOptions(days);
      if (months.length > 0) setSelectedMonth(months[0].value);
      if (days.length   > 0) setSelectedDay(days[0].value);
    }).catch(() => {});
  }, []);

  const activeSelector = mode === 'monthly' ? selectedMonth : selectedDay;

  // Fetch data when mode or selection changes
  useEffect(() => {
    if (!activeSelector) return;
    let cancelled = false;

    const qs = mode === 'daily'
      ? `?day=${activeSelector}`
      : `?month=${activeSelector}`;

    const trendQs = mode === 'daily'
      ? `?mode=daily&upTo=${activeSelector}`
      : `?mode=monthly&upTo=${activeSelector}`;

    setLoading(true);
    setLoadingTrend(true);
    setLoadingComponents(true);

    Promise.all([
      fetch(`/api/material/summary${qs}`).then((r) => r.json()),
      fetch(`/api/material/monthly-trend${trendQs}`).then((r) => r.json()),
      fetch(`/api/material/by-blank${qs}`).then((r) => r.json()),
    ]).then(([s, t, b]) => {
      if (cancelled) return;
      setSummary(s);
      setTrend(t);
      setComponents(b);
    }).catch(() => {}).finally(() => {
      if (!cancelled) {
        setLoading(false);
        setLoadingTrend(false);
        setLoadingComponents(false);
      }
    });

    return () => { cancelled = true; };
  }, [mode, activeSelector]);

  const stock  = summary?.stock ?? 0;
  const isLow  = !loading && stock < threshold;
  const componentH = Math.max(components.length * 38, 240);

  const trendOptions: Options = {
    ...BASE_THEME,
    chart: { ...(BASE_THEME.chart as any), type: 'column', height: 288, margin: [4, 8, 40, 44] },
    xAxis: { ...(BASE_THEME.xAxis as any), categories: trend.map((d) => d.month) },
    yAxis: {
      ...(BASE_THEME.yAxis as any),
      labels: {
        style: { color: 'hsl(var(--foreground))', fontSize: '12px' },
        formatter() {
          const v = this.value as number;
          return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : String(v);
        },
      },
    },
    tooltip: {
      ...(BASE_THEME.tooltip as any),
      pointFormatter(this: any) {
        return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</b><br/>`;
      },
    },
    series: [
      { type: 'column', name: 'Purchased', data: trend.map((d) => d.purchased), color: PURPLE, borderRadius: 3 },
      { type: 'column', name: 'Consumed',  data: trend.map((d) => d.consumed),  color: CORAL,  borderRadius: 3 },
    ],
    plotOptions: { column: { groupPadding: 0.1, maxPointWidth: 32 } },
  };

  const componentsOptions: Options = {
    ...BASE_THEME,
    chart: { ...(BASE_THEME.chart as any), type: 'bar', height: componentH, marginRight: 48, marginTop: 8, marginBottom: 8 },
    xAxis: {
      ...(BASE_THEME.xAxis as any),
      categories: components.map((d) => d.label),
      labels: { style: { color: 'hsl(var(--foreground))', fontSize: '12px' } },
    },
    yAxis: {
      ...(BASE_THEME.yAxis as any),
      labels: {
        style: { color: 'hsl(var(--foreground))', fontSize: '12px' },
        formatter() {
          const v = this.value as number;
          return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : String(v);
        },
      },
    },
    tooltip: {
      ...(BASE_THEME.tooltip as any),
      pointFormatter(this: any) {
        return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</b><br/>`;
      },
    },
    series: [{
      type: 'bar',
      name: 'kg Used',
      data: components.map((row, i) => ({
        y: row.value,
        name: row.label,
        color: `rgba(139,92,246,${1 - i * (0.55 / Math.max(components.length - 1, 1))})`,
      })),
      borderRadius: 3,
      pointWidth: 20,
    }] as any,
    legend: { enabled: false },
    plotOptions: { bar: { groupPadding: 0.1 } },
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Material</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Raw material purchasing and consumption — {mode === 'daily' ? 'daily' : 'monthly'} view
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

      {/* ── Top summary — purchased · gap · consumed ── */}
      <div className="rounded-xl border bg-card shadow-sm px-8 py-7">
        <div className="flex items-center justify-between flex-wrap gap-6">

          {/* Purchased */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {mode === 'daily' ? 'Day' : 'Month'} kg Purchased
            </span>
            <span className="text-4xl font-bold" style={{ color: PURPLE }}>
              {loading ? '—' : (summary?.purchased ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>

          {/* Arrow / gap chip */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-[140px]">
            <div className="flex items-center gap-2 w-full justify-center">
              <div className="h-px flex-1 bg-border" />
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${
                stock >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                           : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {stock >= 0 ? '+' : ''}{loading ? '—' : stock.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <span className="text-[11px] text-muted-foreground text-center leading-tight">
              estimated material<br />in stock (all-time)
            </span>
          </div>

          {/* Consumed */}
          <div className="flex flex-col gap-1 min-w-[160px] items-end text-right">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {mode === 'daily' ? 'Day' : 'Month'} kg Consumed
            </span>
            <span className="text-4xl font-bold" style={{ color: CORAL }}>
              {loading ? '—' : (summary?.consumed ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
        </div>
      </div>

      {/* ── Stock alert ── */}
      <div className={`rounded-xl border px-6 py-5 flex items-start gap-4 ${
        isLow
          ? 'bg-red-500/5 border-red-500/30'
          : 'bg-emerald-500/5 border-emerald-500/20'
      }`}>
        <div className={`mt-0.5 shrink-0 ${isLow ? 'text-red-500' : 'text-emerald-500'}`}>
          {isLow
            ? <AlertTriangle className="h-5 w-5" />
            : <CheckCircle2  className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${isLow ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isLow ? 'Low stock warning' : 'Stock level healthy'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLow
              ? `Estimated stock (${stock.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg) is below the alert threshold of `
              : `Estimated stock (${loading ? '…' : stock.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg) is above the threshold of `}
            <ThresholdEditor value={threshold} onChange={updateThreshold} />.
            {' '}Click the value to change the threshold.
          </p>
        </div>
      </div>

      {/* ── Trend chart ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <p className="text-sm font-bold mb-0.5">
          {mode === 'daily' ? 'Daily kg Purchased vs Consumed (30 days)' : 'Monthly kg Purchased vs Consumed'}
        </p>
        <p className="text-xs text-muted-foreground mb-5">
          {mode === 'daily' ? '30 days up to selected date' : '12 months up to selected month'}
        </p>
        {loadingTrend || !Highcharts ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={trendOptions} />
        )}
      </div>

      {/* ── Consumption by component type ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <p className="text-sm font-bold mb-0.5">Consumption by Component Type</p>
        <p className="text-xs text-muted-foreground mb-5">
          Total kg used per component type — sorted highest to lowest
        </p>
        {loadingComponents ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : components.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No data for selected period</div>
        ) : !Highcharts ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={componentsOptions} />
        )}
      </div>

    </div>
  );
}
