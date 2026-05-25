'use client';

import { useMemo, useState } from 'react';
import { X, BarChart2, TrendingUp, PieChart, AlignLeft, Hash } from 'lucide-react';
import { WIDGET_CATALOG, CATEGORY_COLORS, ChartType, WidgetDef } from './widgetCatalog';
import { KPI_CATALOG, KpiDef } from './kpiCatalog';

const CHART_ICON: Record<ChartType, React.ReactNode> = {
  line:      <TrendingUp className="h-4 w-4" />,
  multiline: <TrendingUp className="h-4 w-4" />,
  bar:       <BarChart2 className="h-4 w-4" />,
  hbar:      <AlignLeft className="h-4 w-4" />,
  donut:     <PieChart className="h-4 w-4" />,
};

const CHART_LABEL: Record<ChartType, string> = {
  line: 'Line', multiline: 'Multi-line', bar: 'Bar', hbar: 'Ranked Bar', donut: 'Donut',
};

/** Category filter pill — coloured when active */
function CatButton({
  label, active, color, onClick,
}: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
      style={
        active && color
          ? { background: `${color}20`, color, border: `1px solid ${color}50` }
          : active
          ? undefined
          : undefined
      }
      // "All" active uses default primary classes; category active uses inline style above
      data-active={active}
      // Fallback Tailwind for "All" active state via className
    >
      <span className={
        active && !color
          ? 'text-foreground font-semibold'
          : !active
          ? 'text-muted-foreground'
          : ''
      }>
        {label}
      </span>
    </button>
  );
}

type Tab = 'kpi' | 'charts';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddChart: (widget: WidgetDef, chartStyle: ChartType) => void;
  onRemoveChart: (id: string) => void;
  onAddKpi: (kpi: KpiDef) => void;
  onRemoveKpi: (id: string) => void;
  addedChartIds: string[];
  addedKpiIds: string[];
}

export default function AddItemDrawer({
  open, onClose,
  onAddChart, onRemoveChart,
  onAddKpi, onRemoveKpi,
  addedChartIds, addedKpiIds,
}: Props) {
  const [tab, setTab] = useState<Tab>('kpi');
  const [chartCategory, setChartCategory] = useState('All');
  const [selectedChartTypes, setSelectedChartTypes] = useState<Record<string, ChartType>>({});

  const chartCategories = ['All', 'Production', 'Sales', 'Materials'] as const;
  const filteredCharts = chartCategory === 'All'
    ? WIDGET_CATALOG
    : WIDGET_CATALOG.filter((w) => w.category === chartCategory);

  const chartSelection = useMemo(
    () =>
      Object.fromEntries(
        WIDGET_CATALOG.map((widget) => [
          widget.id,
          selectedChartTypes[widget.id] ?? widget.supportedChartTypes?.[0] ?? widget.chartType,
        ]),
      ) as Record<string, ChartType>,
    [selectedChartTypes],
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />}

      <div className={`fixed top-0 right-0 z-50 h-full w-96 bg-background border-l shadow-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div>
            <h2 className="font-semibold text-sm">Add to Dashboard</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Add as many as you like — close when done</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 px-4 py-3 border-b shrink-0">
          <button onClick={() => setTab('kpi')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors
              ${tab === 'kpi' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            <Hash className="h-3.5 w-3.5" /> KPI Cards
          </button>
          <button onClick={() => setTab('charts')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors
              ${tab === 'charts' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            <BarChart2 className="h-3.5 w-3.5" /> Charts
          </button>
        </div>

        {/* ── KPI tab ── */}
        {tab === 'kpi' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {KPI_CATALOG.map((kpi) => {
              const added   = addedKpiIds.includes(kpi.id);
              const catColor = CATEGORY_COLORS[kpi.category];
              return (
                <div
                  key={kpi.id}
                  className="rounded-lg border bg-card p-3 flex items-start gap-3 transition-colors hover:border-opacity-80"
                  style={{ borderLeft: `3px solid ${catColor}` }}
                >
                  <div className="rounded-md p-2 shrink-0 mt-0.5" style={{ background: `${catColor}18` }}>
                    <Hash className="h-4 w-4" style={{ color: catColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold">{kpi.name}</p>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: `${catColor}18`, color: catColor }}
                      >
                        {kpi.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{kpi.description}</p>
                    <div className="flex items-center justify-end mt-2">
                      {added ? (
                        <button onClick={() => onRemoveKpi(kpi.id)}
                          className="text-[11px] px-2.5 py-1 rounded-md font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                          Remove
                        </button>
                      ) : (
                        <button onClick={() => onAddKpi(kpi)}
                          className="text-[11px] px-3 py-1 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Charts tab ── */}
        {tab === 'charts' && (
          <>
            {/* Category filter */}
            <div className="flex gap-1.5 px-4 py-2.5 border-b overflow-x-auto shrink-0">
              {chartCategories.map((cat) => {
                const active   = chartCategory === cat;
                const catColor = cat !== 'All' ? CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] : undefined;
                return (
                  <button
                    key={cat}
                    onClick={() => setChartCategory(cat)}
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                    style={
                      active && catColor
                        ? { background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}50` }
                        : active
                        ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: '1px solid transparent' }
                        : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid transparent' }
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredCharts.map((widget) => {
                const added    = addedChartIds.includes(widget.id);
                const catColor = CATEGORY_COLORS[widget.category];
                const supportedChartTypes = widget.supportedChartTypes ?? [widget.chartType];
                const selectedChartType = chartSelection[widget.id];
                return (
                  <div
                    key={widget.id}
                    className="rounded-lg border bg-card p-3 flex items-start gap-3 transition-colors"
                    style={{ borderLeft: `3px solid ${catColor}` }}
                  >
                    <div className="rounded-md p-2 shrink-0 mt-0.5" style={{ background: `${catColor}18` }}>
                      <span style={{ color: catColor }}>{CHART_ICON[widget.chartType]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{widget.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{widget.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ background: `${catColor}18`, color: catColor }}
                          >
                            {widget.category}
                          </span>
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            {CHART_LABEL[selectedChartType]}
                          </span>
                        </div>
                        {added ? (
                          <button onClick={() => onRemoveChart(widget.id)}
                            className="text-[11px] px-2.5 py-1 rounded-md font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                            Remove
                          </button>
                        ) : (
                          <button onClick={() => onAddChart(widget, selectedChartType)}
                            className="text-[11px] px-3 py-1 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            Add
                          </button>
                        )}
                      </div>
                      {supportedChartTypes.length > 1 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {supportedChartTypes.map((chartType) => {
                            const selected = selectedChartType === chartType;
                            return (
                              <button
                                key={chartType}
                                onClick={() =>
                                  setSelectedChartTypes((current) => ({
                                    ...current,
                                    [widget.id]: chartType,
                                  }))
                                }
                                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${
                                  selected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-accent'
                                }`}
                              >
                                {CHART_LABEL[chartType]}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {!added && (
                        <div className="mt-2 text-[10px] text-muted-foreground">
                          Add this widget as a {CHART_LABEL[selectedChartType].toLowerCase()} chart.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Done */}
        <div className="p-4 border-t shrink-0">
          <button onClick={onClose}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2 text-sm font-medium transition-colors">
            Done
          </button>
        </div>
      </div>
    </>
  );
}
