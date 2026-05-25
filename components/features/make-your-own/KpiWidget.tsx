'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, X, GripVertical } from 'lucide-react';
import { KpiDef } from './kpiCatalog';
import { CATEGORY_COLORS } from './widgetCatalog';

interface KpiData {
  current: { month: string; value: number } | null;
  previous: { month: string; value: number } | null;
}

interface Props {
  kpi: KpiDef;
  onRemove: () => void;
}

export default function KpiWidget({ kpi, onRemove }: Props) {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/myo/kpi?id=${kpi.id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [kpi.id]);

  const diff = data?.current && data?.previous ? data.current.value - data.previous.value : null;
  const pct = diff !== null && data?.previous && data.previous.value !== 0
    ? ((diff / Math.abs(data.previous.value)) * 100).toFixed(1)
    : null;

  const fmt = (v: number) => v.toLocaleString() + (kpi.unit ? ` ${kpi.unit}` : '');

  const catColor = CATEGORY_COLORS[kpi.category];

  return (
    <div className="h-full rounded-xl bg-card border border-border shadow-lg flex flex-col overflow-hidden"
      style={{ borderTop: `3px solid ${catColor}` }}>
      {/* Header */}
      <div className="drag-handle flex items-center justify-between px-4 py-2.5 border-b border-border cursor-grab active:cursor-grabbing select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold truncate">{kpi.name}</span>
        </div>
        <button onClick={onRemove} className="rounded p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4 min-h-0 bg-muted/40">
        {loading ? (
          <span className="text-2xl font-bold text-muted-foreground">—</span>
        ) : (
          <>
            <span className="text-2xl font-bold leading-tight">
              {data?.current ? fmt(data.current.value) : '—'}
            </span>

            <div className="mt-2">
              {diff !== null ? (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {diff > 0 ? <TrendingUp className="h-3.5 w-3.5 shrink-0" /> : diff < 0 ? <TrendingDown className="h-3.5 w-3.5 shrink-0" /> : <Minus className="h-3.5 w-3.5 shrink-0" />}
                  <span>{diff > 0 ? '+' : ''}{diff.toLocaleString()}{pct ? ` (${pct}%)` : ''}</span>
                  <span className="text-muted-foreground font-normal">vs prev month</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No previous data</span>
              )}
            </div>

            <span className="text-xs text-muted-foreground mt-auto pt-2">{data?.current?.month ?? ''}</span>
          </>
        )}
      </div>
    </div>
  );
}
