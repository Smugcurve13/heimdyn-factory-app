'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

// ── types ──────────────────────────────────────────────────────────────────
type Shift = 'all' | 'day' | 'night';
interface LabelValue { label: string; value: number }
interface ShiftRow   { shift: string; units: number; scrap: number }
interface ScrapRow   { month: string; scrap: number }
interface ZeroDay    { date: string; weekday: string; label: string }

// ── constants ─────────────────────────────────────────────────────────────
const COLORS  = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

// India's 3 gazetted national holidays (MM-DD, same every year)
const INDIA_NATIONAL_HOLIDAYS = new Set(['01-26', '08-15', '10-02']);
function isIndianNationalHoliday(dateStr: string) {
  // dateStr is 'YYYY-MM-DD'
  return INDIA_NATIONAL_HOLIDAYS.has(dateStr.slice(5));
}

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

function cardClass(extra = '') {
  return `rounded-xl border bg-card shadow-sm p-6 ${extra}`;
}

// ── lollipop panel ───────────────────────────────────────────────────────────
function LollipopPanel({
  title, subtitle, data, loading,
}: {
  title: string; subtitle: string;
  data: LabelValue[]; loading: boolean;
}) {
  const max = data.reduce((m, r) => Math.max(m, r.value), 1);

  return (
    <div className={cardClass()}>
      <p className="text-sm font-bold mb-0.5">{title}</p>
      <p className="text-xs text-muted-foreground mb-6">{subtitle}</p>
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No data</div>
      ) : (
        <div className="space-y-4 py-1">
          {data.map((row, i) => {
            const pct = (row.value / max) * 100;
            const color = COLORS[i % COLORS.length];
            return (
              <div key={row.label} className="flex items-center gap-4">
                {/* label */}
                <span
                  className="w-32 shrink-0 text-right text-xs text-muted-foreground truncate"
                  title={row.label}
                >
                  {row.label}
                </span>

                {/* track + stick + dot */}
                <div className="flex-1 relative h-5 flex items-center">
                  {/* background track */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-border" />
                  {/* stick */}
                  <div
                    className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full"
                    style={{ width: `calc(${pct}% - 8px)`, backgroundColor: color, opacity: 0.45 }}
                  />
                  {/* dot */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center shadow-sm"
                    style={{ left: `calc(${pct}% - 8px)`, backgroundColor: color }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-background" />
                  </div>
                </div>

                {/* value */}
                <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {row.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── horizontal bar panel ─────────────────────────────────────────────────────
function HBarPanel({
  title, subtitle, data, color, loading, barName = 'Units',
}: {
  title: string; subtitle: string;
  data: LabelValue[]; color: string;
  loading: boolean; barName?: string;
}) {
  const [Highcharts, setHighcharts] = useState<any>(null);

  useEffect(() => {
    import('highcharts').then((hc) => setHighcharts(hc.default ?? hc));
  }, []);

  const rowH = 36;
  const chartH = Math.max(data.length * rowH, 200);

  // Parse color hex to rgb for opacity variations
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
      categories: data.map((d) => d.label),
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
      name: barName,
      data: data.map((row, i) => ({
        y: row.value,
        name: row.label,
        color: `rgba(${rgb.r},${rgb.g},${rgb.b},${1 - i * (0.5 / Math.max(data.length - 1, 1))})`,
      })),
      borderRadius: 3,
      pointWidth: 18,
    }] as any,
    legend: { enabled: false },
    plotOptions: { bar: { groupPadding: 0.1 } },
  };

  return (
    <div className={cardClass()}>
      <p className="text-sm font-bold mb-0.5">{title}</p>
      <p className="text-xs text-muted-foreground mb-5">{subtitle}</p>
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No data</div>
      ) : !Highcharts ? (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────
export default function ProductionPage() {
  const [shift, setShift] = useState<Shift>('all');

  const [modelData,    setModelData]    = useState<LabelValue[]>([]);
  const [shiftData,    setShiftData]    = useState<ShiftRow[]>([]);
  const [operatorData, setOperatorData] = useState<LabelValue[]>([]);
  const [scrapData,    setScrapData]    = useState<ScrapRow[]>([]);
  const [zeroDays,     setZeroDays]     = useState<ZeroDay[]>([]);

  const [loading, setLoading] = useState({
    model: true, shift: true, operator: true, scrap: true, zero: true,
  });

  const [Highcharts, setHighcharts] = useState<any>(null);

  useEffect(() => {
    import('highcharts').then((hc) => setHighcharts(hc.default ?? hc));
  }, []);

  useEffect(() => {
    const s = shift;
    setLoading({ model: true, shift: true, operator: true, scrap: true, zero: true });

    Promise.all([
      fetch(`/api/production/by-model?shift=${s}`).then((r) => r.json()),
      fetch(`/api/production/shift-comparison?shift=${s}`).then((r) => r.json()),
      fetch(`/api/production/by-operator?shift=${s}`).then((r) => r.json()),
      fetch(`/api/production/wastage-trend?shift=${s}`).then((r) => r.json()),
      fetch(`/api/production/zero-days?shift=${s}`).then((r) => r.json()),
    ]).then(([m, sh, op, w, z]) => {
      setModelData(m);
      setShiftData(sh);
      setOperatorData(op);
      setScrapData(w);
      setZeroDays(z);
      setLoading({ model: false, shift: false, operator: false, scrap: false, zero: false });
    });
  }, [shift]);

  // ── scrap trend direction ──────────────────────────────────────────────────
  const scrapTrend = (() => {
    if (scrapData.length < 4) return 'flat';
    const half = Math.floor(scrapData.length / 2);
    const firstHalf  = scrapData.slice(0, half).reduce((s, r) => s + r.scrap, 0) / half;
    const secondHalf = scrapData.slice(-half).reduce((s, r) => s + r.scrap, 0) / half;
    if (secondHalf > firstHalf * 1.05) return 'up';
    if (secondHalf < firstHalf * 0.95) return 'down';
    return 'flat';
  })();

  const scrapPct = (() => {
    if (scrapData.length < 2) return null;
    const first = scrapData[0].scrap;
    const last  = scrapData[scrapData.length - 1].scrap;
    if (first === 0) return null;
    return (((last - first) / first) * 100).toFixed(1);
  })();

  const avg = scrapData.reduce((s, r) => s + r.scrap, 0) / (scrapData.length || 1);

  const shiftOptions: Options = {
    ...BASE_THEME,
    chart: { ...(BASE_THEME.chart as any), type: 'column', height: 224, margin: [4, 8, 40, 40] },
    xAxis: {
      ...(BASE_THEME.xAxis as any),
      categories: shiftData.map((d) => d.shift),
    },
    yAxis: {
      ...(BASE_THEME.yAxis as any),
      labels: {
        style: { color: 'hsl(var(--foreground))', fontSize: '12px' },
        formatter() { return (this.value as number) >= 1000 ? `${((this.value as number)/1000).toFixed(0)}k` : String(this.value); },
      },
    },
    series: [
      { type: 'column', name: 'Units Made', data: shiftData.map((d) => d.units), color: '#3b82f6', borderRadius: 3 },
      { type: 'column', name: 'Scrap',      data: shiftData.map((d) => d.scrap), color: '#f97316', borderRadius: 3 },
    ],
    plotOptions: { column: { groupPadding: 0.1, maxPointWidth: 40 } },
  };

  const scrapOptions: Options = {
    ...BASE_THEME,
    chart: { ...(BASE_THEME.chart as any), type: 'spline', height: 240, margin: [4, 12, 40, 40] },
    xAxis: {
      ...(BASE_THEME.xAxis as any),
      categories: scrapData.map((d) => d.month),
    },
    yAxis: {
      ...(BASE_THEME.yAxis as any),
      labels: {
        style: { color: 'hsl(var(--foreground))', fontSize: '12px' },
        formatter() { return (this.value as number) >= 1000 ? `${((this.value as number)/1000).toFixed(0)}k` : String(this.value); },
      },
      plotLines: [{
        value: avg,
        color: 'hsl(var(--foreground))',
        dashStyle: 'Dash' as any,
        width: 1,
        label: { text: 'avg', align: 'right', style: { color: 'hsl(var(--foreground))', fontSize: '11px' } },
      }],
    },
    series: [{
      type: 'spline',
      name: 'Scrap',
      data: scrapData.map((d) => d.scrap),
      color: '#f97316',
      lineWidth: 2,
      marker: { radius: 3, fillColor: '#f97316' },
    }],
    legend: { enabled: false },
  };

  const SHIFTS: { key: Shift; label: string }[] = [
    { key: 'all',   label: 'All'   },
    { key: 'day',   label: 'Day'   },
    { key: 'night', label: 'Night' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Production</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unit output, operator performance, and scrap analytics
          </p>
        </div>

        {/* Shift toggle */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
          {SHIFTS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setShift(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                shift === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel 1 — Units by product line ── */}
      <HBarPanel
        title="Units Produced by Product Line"
        subtitle="Total output per product line — sorted highest to lowest"
        data={modelData}
        color="#3b82f6"
        loading={loading.model}
      />

      {/* ── Panel 2 — Shift comparison ── */}
      <div className={cardClass()}>
        <p className="text-sm font-bold mb-0.5">Shift Comparison</p>
        <p className="text-xs text-muted-foreground mb-5">
          Total units made and scrap per shift
        </p>
        {loading.shift ? (
          <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">Loading…</div>
        ) : shiftData.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">No data</div>
        ) : !Highcharts ? (
          <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={shiftOptions} />
        )}
      </div>

      {/* ── Panel 3 — Operator-wise production ── */}
      <LollipopPanel
        title="Operator-wise Production"
        subtitle="Total units made per operator — sorted highest to lowest"
        data={operatorData}
        loading={loading.operator}
      />

      {/* ── Panel 4 — Scrap trend ── */}
      <div className={cardClass()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-sm font-bold mb-0.5">Scrap Trend</p>
            <p className="text-xs text-muted-foreground">Monthly scrap over last 12 months</p>
          </div>
          {!loading.scrap && (
            <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${
              scrapTrend === 'up'   ? 'bg-red-500/10 text-red-500'
              : scrapTrend === 'down' ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-muted text-muted-foreground'
            }`}>
              {scrapTrend === 'up'   && <TrendingUp   className="h-4 w-4" />}
              {scrapTrend === 'down' && <TrendingDown className="h-4 w-4" />}
              {scrapTrend === 'flat' && <Minus        className="h-4 w-4" />}
              <span>
                {scrapTrend === 'up'   ? `↑ Increasing${scrapPct ? ` (${scrapPct}%)` : ''}`
                : scrapTrend === 'down' ? `↓ Decreasing${scrapPct ? ` (${scrapPct}%)` : ''}`
                : 'Stable'}
              </span>
            </div>
          )}
        </div>
        {loading.scrap ? (
          <div className="flex items-center justify-center h-60 text-sm text-muted-foreground">Loading…</div>
        ) : !Highcharts ? (
          <div className="flex items-center justify-center h-60 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={scrapOptions} />
        )}
      </div>

      {/* ── Panel 5 — Zero-production days ── */}
      <div className={cardClass()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-sm font-bold mb-0.5">Days with Zero Production</p>
            <p className="text-xs text-muted-foreground">
              Dates in the full data range with no recorded output
              {shift !== 'all' ? ` for the ${shift === 'day' ? 'day' : 'night'} shift` : ''}
            </p>
          </div>
          {!loading.zero && (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              zeroDays.length === 0
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {zeroDays.length === 0 ? 'None found' : `${zeroDays.length} day${zeroDays.length > 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        {loading.zero ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Loading…</div>
        ) : zeroDays.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            No zero-production days — every day in range has output recorded.
          </div>
        ) : (
          <div className="overflow-auto max-h-80">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2 pr-6">#</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2 pr-6">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2 pr-6">Day</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2">National Holiday</th>
                </tr>
              </thead>
              <tbody>
                {zeroDays.map((d, i) => {
                  const holiday = isIndianNationalHoliday(d.date);
                  return (
                  <tr
                    key={d.date}
                    className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/30'}`}
                  >
                    <td className="py-2 pr-6 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="py-2 pr-6 font-medium tabular-nums">{d.label}</td>
                    <td className="py-2 pr-6 text-muted-foreground">{d.weekday}</td>
                    <td className="py-2">
                      {holiday
                        ? <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Yes</span>
                        : <span className="text-xs text-muted-foreground">No</span>}
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
