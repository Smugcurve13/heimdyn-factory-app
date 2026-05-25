'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import GridLayout, { LayoutItem, Layout } from 'react-grid-layout';
import { Plus, ArrowLeft, LayoutDashboard, Trash2 } from 'lucide-react';
import { loadDashboard, saveDashboard, deleteDashboard, DashboardItem } from '@/lib/dashboardStorage';
import { WIDGET_CATALOG, WidgetDef, ChartType } from '@/components/features/make-your-own/widgetCatalog';
import { KPI_CATALOG, KpiDef } from '@/components/features/make-your-own/kpiCatalog';
import AddItemDrawer from '@/components/features/make-your-own/AddItemDrawer';
import ChartWidget from '@/components/features/make-your-own/ChartWidget';
import KpiWidget from '@/components/features/make-your-own/KpiWidget';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const COLS = 12;
const ROW_H = 60;

export default function DashboardBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dashName, setDashName] = useState('');
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [width, setWidth] = useState(800);

  // ── Measure canvas container width precisely ──────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    // Set initial width
    setWidth(el.clientWidth);
    // Update on any resize (sidebar toggle, window resize, etc.)
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    loadDashboard(id).then((dash) => {
      if (!dash) { router.push('/make-your-own'); return; }
      setDashName(dash.name);
      setItems(dash.items);
      setLayout(dash.layout);
    });
  }, [id, router]);

  const persist = useCallback((newItems: DashboardItem[], newLayout: LayoutItem[]) => {
    saveDashboard({ id, name: dashName, createdAt: '', items: newItems, layout: newLayout });
  }, [id, dashName]);

  const addItem = useCallback((type: 'chart' | 'kpi', widgetId: string, w: number, h: number, chartStyle?: ChartType) => {
    const layoutId = type === 'chart' && chartStyle
      ? `${type}-${widgetId}-${chartStyle}`
      : `${type}-${widgetId}`;
    if (items.find((i) => i.layoutId === layoutId)) return;
    const maxY = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
    const minH = type === 'kpi' ? 2 : 3;
    const newLayoutItem: LayoutItem = { i: layoutId, x: 0, y: maxY, w, h, minW: 2, minH };
    const newItem: DashboardItem = { layoutId, type, widgetId, chartStyle };
    const nextItems = [...items, newItem];
    const nextLayout = [...layout, newLayoutItem];
    setItems(nextItems);
    setLayout(nextLayout);
    persist(nextItems, nextLayout);
  }, [items, layout, persist]);

  const updateChartStyle = useCallback((layoutId: string, chartStyle: ChartType) => {
    const item = items.find((entry) => entry.layoutId === layoutId);
    const layoutItem = layout.find((entry) => entry.i === layoutId);
    if (!item || item.type !== 'chart' || !layoutItem) return;

    const nextLayoutId = `chart-${item.widgetId}-${chartStyle}`;
    if (nextLayoutId !== layoutId && items.some((entry) => entry.layoutId === nextLayoutId)) return;

    const nextItems = items.map((entry) =>
      entry.layoutId === layoutId
        ? { ...entry, layoutId: nextLayoutId, chartStyle }
        : entry,
    );

    const nextLayout = layout.map((entry) =>
      entry.i === layoutId ? { ...entry, i: nextLayoutId } : entry,
    );

    setItems(nextItems);
    setLayout(nextLayout);
    persist(nextItems, nextLayout);
  }, [items, layout, persist]);

  const removeItem = useCallback((layoutId: string) => {
    const nextItems = items.filter((i) => i.layoutId !== layoutId);
    const nextLayout = layout.filter((l) => l.i !== layoutId);
    setItems(nextItems);
    setLayout(nextLayout);
    persist(nextItems, nextLayout);
  }, [items, layout, persist]);

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    const mutable = [...newLayout] as LayoutItem[];
    setLayout(mutable);
    persist(items, mutable);
  }, [items, persist]);

  const handleDeleteDashboard = useCallback(() => {
    deleteDashboard(id).then(() => router.push('/make-your-own'));
  }, [id, router]);

  const addedChartIds = items.filter((i) => i.type === 'chart').map((i) => i.widgetId);
  const addedKpiIds = items.filter((i) => i.type === 'kpi').map((i) => i.widgetId);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/make-your-own')}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{dashName}</h1>
            <p className="text-xs text-muted-foreground">Drag to rearrange · Resize from corners</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteDashboard}
            className="flex items-center gap-2 rounded-lg border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete Dashboard
          </button>
          <button onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Canvas — ref measures the real inner width */}
      <div ref={canvasRef} className="flex-1 p-4 overflow-hidden min-w-0">
        {items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-[60vh] rounded-2xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-accent/10 transition-colors"
            onClick={() => setDrawerOpen(true)}
          >
            <div className="rounded-full bg-muted p-4 mb-4">
              <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold">This dashboard is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click here or press <span className="font-medium text-foreground">+ Add</span> to add KPI cards and charts
            </p>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={layout}
            width={width}
            gridConfig={{ cols: COLS, rowHeight: ROW_H, margin: [12, 12] }}
            dragConfig={{ handle: '.drag-handle' }}
            resizeConfig={{ handles: ['se'] }}
            onLayoutChange={handleLayoutChange}
          >
            {items.map((item) => {
              if (item.type === 'kpi') {
                const kpi: KpiDef | undefined = KPI_CATALOG.find((k: KpiDef) => k.id === item.widgetId);
                if (!kpi) return <div key={item.layoutId} />;
                return (
                  <div key={item.layoutId} className="h-full overflow-hidden">
                    <KpiWidget kpi={kpi} onRemove={() => removeItem(item.layoutId)} />
                  </div>
                );
              }
              const widget: WidgetDef | undefined = WIDGET_CATALOG.find((w) => w.id === item.widgetId);
              if (!widget) return <div key={item.layoutId} />;
              return (
                <div key={item.layoutId} className="h-full overflow-hidden">
                  <ChartWidget
                    widget={widget}
                    chartStyle={item.chartStyle}
                    onChartStyleChange={(chartStyle) => updateChartStyle(item.layoutId, chartStyle)}
                    onRemove={() => removeItem(item.layoutId)}
                  />
                </div>
              );
            })}
          </GridLayout>
        )}
      </div>

      <AddItemDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAddChart={(w, chartStyle) => addItem('chart', w.id, w.defaultW, w.defaultH, chartStyle)}
        onRemoveChart={(id) => removeItem(`chart-${id}`)}
        onAddKpi={(k) => addItem('kpi', k.id, 3, 3)}
        onRemoveKpi={(id) => removeItem(`kpi-${id}`)}
        addedChartIds={addedChartIds}
        addedKpiIds={addedKpiIds}
      />
    </div>
  );
}
