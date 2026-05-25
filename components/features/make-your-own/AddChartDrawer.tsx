'use client';

import { useState } from 'react';
import { X, BarChart2, TrendingUp, PieChart, AlignLeft } from 'lucide-react';
import { WIDGET_CATALOG, CATEGORIES, WidgetDef, ChartType } from './widgetCatalog';

const CHART_ICON: Record<ChartType, React.ReactNode> = {
  line:      <TrendingUp className="h-4 w-4" />,
  multiline: <TrendingUp className="h-4 w-4" />,
  bar:       <BarChart2 className="h-4 w-4" />,
  hbar:      <AlignLeft className="h-4 w-4" />,
  donut:     <PieChart className="h-4 w-4" />,
};

const CHART_LABEL: Record<ChartType, string> = {
  line:      'Line',
  multiline: 'Multi-line',
  bar:       'Bar',
  hbar:      'Ranked Bar',
  donut:     'Donut',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (widget: WidgetDef) => void;
  onRemove: (id: string) => void;
  addedIds: string[];
}

export default function AddChartDrawer({ open, onClose, onAdd, onRemove, addedIds }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...CATEGORIES];
  const filtered = activeCategory === 'All'
    ? WIDGET_CATALOG
    : WIDGET_CATALOG.filter((w) => w.category === activeCategory);

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 z-50 h-full w-96 bg-background border-l shadow-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Add Charts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Add as many as you like, then close when done</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 py-3 border-b overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors
                ${activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Widget list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-0">
          {filtered.map((widget) => {
            const added = addedIds.includes(widget.id);
            return (
              <div
                key={widget.id}
                className="rounded-lg border bg-card p-3 flex items-start gap-3 hover:border-primary/40 transition-colors"
              >
                {/* Color swatch */}
                <div className="rounded-md p-2 shrink-0 mt-0.5" style={{ background: `${widget.color}20` }}>
                  <span style={{ color: widget.color }}>{CHART_ICON[widget.chartType]}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold">{widget.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{widget.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{widget.category}</span>
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{CHART_LABEL[widget.chartType]}</span>
                    </div>
                    {added ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-emerald-500 font-medium">✓ Added</span>
                        <button
                          onClick={() => onRemove(widget.id)}
                          className="text-[11px] px-2.5 py-1 rounded-md font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAdd(widget)}
                        className="text-[11px] px-3 py-1 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Done button */}
        <div className="p-4 border-t shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
