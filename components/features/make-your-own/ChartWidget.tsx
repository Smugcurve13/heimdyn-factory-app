'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';
import { WidgetDef, ChartType, CATEGORY_COLORS } from './widgetCatalog';
import { X, GripVertical } from 'lucide-react';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

interface Props {
  widget: WidgetDef;
  chartStyle?: ChartType;
  onChartStyleChange?: (chartStyle: ChartType) => void;
  onRemove: () => void;
}

const DONUT_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#84cc16','#14b8a6'];

const BASE_THEME: Partial<Options> = {
  chart: { backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
  title: { text: undefined }, subtitle: { text: undefined }, credits: { enabled: false },
  legend: { itemStyle: { color: '#9CA3AF', fontWeight: '500', fontSize: '12px' }, itemHoverStyle: { color: '#F9FAFB' } },
  xAxis: { labels: { style: { color: '#9CA3AF', fontSize: '11px' } }, lineColor: 'transparent', tickColor: 'transparent', gridLineWidth: 0 },
  yAxis: { labels: { style: { color: '#9CA3AF', fontSize: '11px' } }, gridLineWidth: 0, title: { text: null } },
  tooltip: { backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 8, style: { color: 'hsl(var(--popover-foreground))', fontSize: '13px' }, shadow: { color: '#000', opacity: 0.3, offsetX: 0, offsetY: 4, width: 12 } },
};

export default function ChartWidget({ widget, chartStyle, onChartStyleChange, onRemove }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [Highcharts, setHighcharts] = useState<any>(null);

  useEffect(() => {
    import('highcharts').then((hc) => setHighcharts(hc.default ?? hc));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/myo/widget?id=${widget.id}`)
      .then((r) => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then((rows) => setData(rows.map((r: any) => ({
        ...r,
        value:     r.value     != null ? Number(r.value)     : undefined,
        produced:  r.produced  != null ? Number(r.produced)  : undefined,
        delivered: r.delivered != null ? Number(r.delivered) : undefined,
      }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [widget.id]);

  const tickFmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);
  const effectiveType: ChartType = chartStyle ?? widget.chartType;

  const renderChart = () => {
    if (loading) return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading…</div>;
    if (error)   return <div className="flex items-center justify-center h-full text-sm text-destructive">{error}</div>;
    if (!data.length) return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data</div>;
    if (!Highcharts) return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading…</div>;

    if (effectiveType === 'line') {
      const options: Options = {
        ...BASE_THEME,
        chart: { ...BASE_THEME.chart, type: 'spline', height: '100%' },
        xAxis: { ...BASE_THEME.xAxis, categories: data.map(d => d.label) },
        yAxis: { ...BASE_THEME.yAxis, labels: { formatter() { return tickFmt(this.value as number) } } },
        plotOptions: { spline: { marker: { radius: 4, symbol: 'circle' } } },
        series: [{
          type: 'spline' as const,
          name: widget.name,
          color: widget.color,
          data: data.map(d => d.value),
          showInLegend: false,
        }],
      };
      return (
        <div style={{ height: '100%' }}>
          <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: '100%' } }} />
        </div>
      );
    }

    if (effectiveType === 'multiline') {
      const options: Options = {
        ...BASE_THEME,
        chart: { ...BASE_THEME.chart, type: 'spline', height: '100%' },
        xAxis: { ...BASE_THEME.xAxis, categories: data.map(d => d.label) },
        yAxis: { ...BASE_THEME.yAxis, labels: { formatter() { return tickFmt(this.value as number) } } },
        legend: { ...BASE_THEME.legend, enabled: true },
        plotOptions: { spline: { marker: { radius: 4, symbol: 'circle' } } },
        series: [
          {
            type: 'spline' as const,
            name: 'Produced',
            color: '#10b981',
            data: data.map(d => d.produced),
          },
          {
            type: 'spline' as const,
            name: 'Delivered',
            color: '#3b82f6',
            data: data.map(d => d.delivered),
          },
        ],
      };
      return (
        <div style={{ height: '100%' }}>
          <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: '100%' } }} />
        </div>
      );
    }

    if (effectiveType === 'bar') {
      const options: Options = {
        ...BASE_THEME,
        chart: { ...BASE_THEME.chart, type: 'column', height: '100%' },
        xAxis: { ...BASE_THEME.xAxis, categories: data.map(d => d.label) },
        yAxis: { ...BASE_THEME.yAxis, labels: { formatter() { return tickFmt(this.value as number) } } },
        plotOptions: { column: { borderWidth: 0, borderRadius: 4 } },
        series: [{
          type: 'column' as const,
          name: widget.name,
          color: widget.color,
          data: data.map(d => d.value),
          showInLegend: false,
        }],
      };
      return (
        <div style={{ height: '100%' }}>
          <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: '100%' } }} />
        </div>
      );
    }

    if (effectiveType === 'hbar') return (
      <div className="flex flex-col gap-3 overflow-y-auto h-full pr-1">
        {data.map((row, i) => {
          const pct = (row.value / data[0].value) * 100;
          const val = row.value >= 1000 ? `${(row.value / 1000).toFixed(1)}k` : row.value;
          return (
            <div key={i} className="flex items-center gap-3 min-w-0">
              <span className="text-xs text-muted-foreground w-4 shrink-0 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate pr-2">{row.label}</span>
                  <span className="text-xs font-semibold shrink-0" style={{ color: widget.color }}>{val}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: widget.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    if (effectiveType === 'donut') {
      const options: Options = {
        ...BASE_THEME,
        chart: { ...BASE_THEME.chart, type: 'pie', height: '100%' },
        plotOptions: {
          pie: {
            innerSize: '50%',
            dataLabels: { enabled: false },
            showInLegend: true,
          },
        },
        legend: { ...BASE_THEME.legend, enabled: true, itemStyle: { ...BASE_THEME.legend?.itemStyle, fontSize: '11px' } },
        series: [{
          type: 'pie' as const,
          name: widget.name,
          data: data.map((d, i) => ({
            name: d.label,
            y: d.value,
            color: DONUT_COLORS[i % DONUT_COLORS.length],
          })),
        }],
        tooltip: {
          ...BASE_THEME.tooltip,
          pointFormatter: function(this: any) {
            return `<b>${Number(this.y).toLocaleString()}</b>`;
          },
        },
      };
      return (
        <div style={{ height: '100%' }}>
          <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: '100%' } }} />
        </div>
      );
    }

    return null;
  };

  const catColor = CATEGORY_COLORS[widget.category];

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-xl bg-card shadow-lg border border-border"
      style={{ borderTop: `3px solid ${catColor}` }}>
      {/* Header */}
      <div className="drag-handle flex items-center justify-between px-4 py-2.5 border-b border-border cursor-grab active:cursor-grabbing select-none shrink-0 bg-card">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold truncate">{widget.name}</span>
        </div>
        <button onClick={onRemove}
          className="rounded p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 p-4 min-h-0 bg-muted/40">
        {renderChart()}
      </div>
    </div>
  );
}
