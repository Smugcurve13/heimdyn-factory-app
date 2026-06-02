'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

// ── types ──────────────────────────────────────────────────────────────────
interface QoQRow      { quarter: string; produced: number; delivered: number }
interface InvRow      { month: string; produced: number; delivered: number; cumulative: number }
interface YieldRow    { label: string; yield_rate: number; units: number; kgs: number }
interface DowRow      { day: string; avg_units: number; sort: number }

// ── constants ─────────────────────────────────────────────────────────────
const BLUE   = '#3b82f6';
const GREEN  = '#10b981';
const PURPLE = '#8b5cf6';
const ORANGE = '#f97316';
const KFMT   = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);

// ── base theme ────────────────────────────────────────────────────────────
const BASE_THEME: Partial<Options> = {
  chart: { backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
  title: { text: undefined },
  subtitle: { text: undefined },
  credits: { enabled: false },
  legend: { itemStyle: { color: '#9CA3AF', fontWeight: '500', fontSize: '12px' }, itemHoverStyle: { color: '#F9FAFB' } },
  xAxis: { labels: { style: { color: '#9CA3AF', fontSize: '11px' } }, lineColor: 'transparent', tickColor: 'transparent', gridLineWidth: 0 },
  yAxis: { labels: { style: { color: '#9CA3AF', fontSize: '11px' } }, gridLineWidth: 0, title: { text: null } },
  tooltip: {
    backgroundColor: 'hsl(var(--popover))',
    borderColor: 'hsl(var(--border))', borderRadius: 8,
    style: { color: 'hsl(var(--popover-foreground))', fontSize: '13px' },
    shadow: { color: '#000', opacity: 0.3, offsetX: 0, offsetY: 4, width: 12 },
  },
};

// ── year toggle ───────────────────────────────────────────────────────────
function YearToggle({ years, selected, onChange }: {
  years: number[]; selected: number; onChange: (y: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      {years.map((y) => (
        <button
          key={y}
          onClick={() => onChange(y)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selected === y
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const [Highcharts, setHighcharts] = useState<any>(null);

  const [years,    setYears]    = useState<number[]>([]);
  const [year,     setYear]     = useState<number | null>(null);

  const [qoq,     setQoq]      = useState<QoQRow[]>([]);
  const [inv,     setInv]      = useState<InvRow[]>([]);
  const [yieldData, setYield]  = useState<YieldRow[]>([]);
  const [dow,     setDow]      = useState<DowRow[]>([]);

  const [loading, setLoading]  = useState({ qoq: true, inv: true, yield: true, dow: true });

  useEffect(() => {
    import('highcharts').then((hc) => setHighcharts(hc.default ?? hc));
  }, []);

  // fetch available years once
  useEffect(() => {
    fetch('/api/analysis/years')
      .then((r) => r.json())
      .then((ys: number[]) => {
        setYears(ys);
        // default: max year in data
        setYear(ys[0] ?? new Date().getFullYear());
      });
  }, []);

  // fetch all panels when year changes
  useEffect(() => {
    if (year === null) return;
    setLoading({ qoq: true, inv: true, yield: true, dow: true });

    Promise.all([
      fetch(`/api/analysis/qoq?year=${year}`).then((r) => r.json()),
      fetch(`/api/analysis/inventory-buildup?year=${year}`).then((r) => r.json()),
      fetch(`/api/analysis/yield-by-model`).then((r) => r.json()),
      fetch(`/api/analysis/dayofweek?year=${year}`).then((r) => r.json()),
    ]).then(([q, i, y, d]) => {
      setQoq(q);
      setInv(i);
      setYield(y);
      setDow(d);
      setLoading({ qoq: false, inv: false, yield: false, dow: false });
    });
  }, [year]);

  // ── inventory trend ───────────────────────────────────────────────────
  // filter out trailing zero-months (no data yet)
  const invTrimmed = (() => {
    const rows = [...inv];
    while (rows.length > 0 && rows[rows.length - 1].produced === 0 && rows[rows.length - 1].delivered === 0) {
      rows.pop();
    }
    return rows;
  })();

  const lastCumulative = invTrimmed.length ? invTrimmed[invTrimmed.length - 1].cumulative : 0;
  const firstCumulative = invTrimmed.length ? invTrimmed[0].cumulative : 0;
  const invTrend = lastCumulative > firstCumulative + 50 ? 'up'
    : lastCumulative < firstCumulative - 50 ? 'down'
    : 'flat';

  // ── yield panel sizing ────────────────────────────────────────────────
  const yieldH = Math.max(yieldData.length * 38, 200);

  // ── chart options ─────────────────────────────────────────────────────

  // Panel 1: QoQ grouped column chart
  const qoqOptions: Options = {
    ...BASE_THEME,
    chart: { ...BASE_THEME.chart, type: 'column', height: 256 },
    xAxis: {
      ...(BASE_THEME.xAxis as object),
      categories: qoq.map((r) => r.quarter),
    },
    yAxis: {
      ...(BASE_THEME.yAxis as object),
      labels: {
        style: { color: '#9CA3AF', fontSize: '11px' },
        formatter: function (this: any) { return KFMT(this.value); },
      },
    },
    plotOptions: {
      column: {
        groupPadding: 0.15,
        pointPadding: 0.05,
        maxPointWidth: 48,
        borderRadius: 3,
        borderWidth: 0,
      },
    },
    series: [
      { type: 'column', name: 'Produced',  data: qoq.map((r) => r.produced),  color: BLUE },
      { type: 'column', name: 'Delivered', data: qoq.map((r) => r.delivered), color: GREEN },
    ],
  };

  // Panel 2: Inventory build-up spline
  const invOptions: Options = {
    ...BASE_THEME,
    chart: { ...BASE_THEME.chart, type: 'spline', height: 256 },
    xAxis: {
      ...(BASE_THEME.xAxis as object),
      categories: invTrimmed.map((r) => r.month),
    },
    yAxis: {
      ...(BASE_THEME.yAxis as object),
      labels: {
        style: { color: '#9CA3AF', fontSize: '11px' },
        formatter: function (this: any) { return KFMT(this.value); },
      },
      plotLines: [
        { value: 0, color: '#9CA3AF', dashStyle: 'Dash', width: 1 },
      ],
    },
    legend: { enabled: false },
    tooltip: {
      ...BASE_THEME.tooltip,
      formatter: function (this: any) {
        const i = this.point.index;
        const row = invTrimmed[i];
        return `<b>${this.x}</b><br/><span style="color:${PURPLE}">Cumulative gap: ${this.y.toLocaleString()}</span><br/><span style="color:${BLUE}">Produced: ${row.produced.toLocaleString()}</span><br/><span style="color:${GREEN}">Delivered: ${row.delivered.toLocaleString()}</span>`;
      },
    },
    series: [
      {
        type: 'spline',
        name: 'Cumulative gap',
        data: invTrimmed.map((r) => r.cumulative),
        color: PURPLE,
        lineWidth: 2.5,
        marker: { radius: 3.5, fillColor: PURPLE },
      },
    ],
  };

  // Panel 3: Yield by product line — horizontal bar
  const yieldOptions: Options = {
    ...BASE_THEME,
    chart: { ...BASE_THEME.chart, type: 'bar', height: yieldH, marginLeft: 150 },
    xAxis: {
      ...(BASE_THEME.xAxis as object),
      categories: yieldData.map((r) => r.label),
      title: { text: null },
    },
    yAxis: {
      ...(BASE_THEME.yAxis as object),
      labels: {
        style: { color: '#9CA3AF', fontSize: '11px' },
      },
      title: { text: 'units / kg', style: { color: '#9CA3AF', fontSize: '10px' } },
    },
    legend: { enabled: false },
    tooltip: {
      ...BASE_THEME.tooltip,
      formatter: function (this: any) {
        const row = yieldData[this.point.index];
        return `<b>${this.point.name ?? this.point.category}</b><br/><span style="color:${ORANGE}">Yield: ${this.y.toFixed(3)} units/kg</span><br/>Units: ${row.units.toLocaleString()}<br/>kg consumed: ${row.kgs.toLocaleString()}`;
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        borderWidth: 0,
        pointWidth: 18,
      },
    },
    series: [
      {
        type: 'bar',
        name: 'Yield (units/kg)',
        data: yieldData.map((row, i) => ({
          y: row.yield_rate,
          color: `rgba(249,115,22,${1 - i * (0.5 / Math.max(yieldData.length - 1, 1))})`,
        })),
      },
    ],
  };

  // Panel 4: Day of week column chart
  const maxDow = dow.length > 0 ? Math.max(...dow.map((d) => d.avg_units)) : 1;
  const dowOptions: Options = {
    ...BASE_THEME,
    chart: { ...BASE_THEME.chart, type: 'column', height: 208 },
    xAxis: {
      ...(BASE_THEME.xAxis as object),
      categories: dow.map((r) => r.day),
    },
    yAxis: {
      ...(BASE_THEME.yAxis as object),
      labels: {
        style: { color: '#9CA3AF', fontSize: '11px' },
        formatter: function (this: any) { return KFMT(this.value); },
      },
    },
    legend: { enabled: false },
    tooltip: {
      ...BASE_THEME.tooltip,
      formatter: function (this: any) {
        return `<b>${this.x}</b><br/><span style="color:${BLUE}">Avg units: ${this.y.toLocaleString()}</span>`;
      },
    },
    plotOptions: {
      column: {
        maxPointWidth: 56,
        borderRadius: 3,
        borderWidth: 0,
      },
    },
    series: [
      {
        type: 'column',
        name: 'Avg units',
        data: dow.map((row) => ({
          y: row.avg_units,
          color: `rgba(59,130,246,${0.25 + (maxDow > 0 ? row.avg_units / maxDow : 0) * 0.75})`,
        })),
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">

      {/* ── Header + year selector ── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full-year deep-dive — independent of any global date filter
          </p>
        </div>
        {years.length > 0 && year !== null && (
          <YearToggle years={years} selected={year} onChange={setYear} />
        )}
      </div>

      {/* ── Panel 1 — Quarter-on-quarter comparison ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <p className="text-sm font-bold mb-0.5">Quarter-on-Quarter Comparison</p>
        <p className="text-xs text-muted-foreground mb-5">
          Production vs delivery units per quarter — {year}
        </p>
        {!Highcharts || loading.qoq ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={qoqOptions} />
        )}
      </div>

      {/* ── Panel 2 — Inventory build-up ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-sm font-bold mb-0.5">Inventory Build-up Estimate</p>
            <p className="text-xs text-muted-foreground">
              Cumulative (production − delivery) month by month — {year}
            </p>
          </div>
          {!loading.inv && invTrimmed.length > 0 && (
            <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${
              invTrend === 'up'   ? 'bg-emerald-500/10 text-emerald-500'
              : invTrend === 'down' ? 'bg-red-500/10 text-red-500'
              : 'bg-muted text-muted-foreground'
            }`}>
              {invTrend === 'up'   && <TrendingUp   className="h-4 w-4" />}
              {invTrend === 'down' && <TrendingDown className="h-4 w-4" />}
              {invTrend === 'flat' && <Minus        className="h-4 w-4" />}
              <span>
                {invTrend === 'up'   ? 'Stock building up'
                : invTrend === 'down' ? 'Drawing from stock'
                : 'Stable'}
              </span>
              <span className="text-xs opacity-70">
                ({lastCumulative >= 0 ? '+' : ''}{lastCumulative.toLocaleString()} units YTD)
              </span>
            </div>
          )}
        </div>
        {!Highcharts || loading.inv ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={invOptions} />
        )}
      </div>

      {/* ── Panel 3 — Yield rate by product line ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <p className="text-sm font-bold mb-0.5">Yield Rate by Product Line</p>
        <p className="text-xs text-muted-foreground mb-5">
          Units produced per kg consumed — higher is better — all-time
        </p>
        {!Highcharts || loading.yield ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : yieldData.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">No data for {year}</div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={yieldOptions} />
        )}
      </div>

      {/* ── Panel 4 — Day-of-week heatmap ── */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <p className="text-sm font-bold mb-0.5">Production by Day of Week</p>
        <p className="text-xs text-muted-foreground mb-5">
          Average daily units per weekday — {year}
        </p>
        {!Highcharts || loading.dow ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            <HighchartsReact highcharts={Highcharts} options={dowOptions} />
            {/* summary row */}
            <div className="mt-4 grid grid-cols-7 gap-1">
              {dow.map((row) => {
                const max = Math.max(...dow.map((d) => d.avg_units));
                const pct  = max > 0 ? (row.avg_units / max) * 100 : 0;
                return (
                  <div key={row.day} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{row.day}</span>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-medium tabular-nums">
                      {row.avg_units > 0 ? KFMT(Math.round(row.avg_units)) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
