'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrailDocType = 'QT' | 'SO' | 'MO' | 'PO';

export interface TrailNode {
  type: TrailDocType;
  id: string;
  status?: string;
}

const ROUTE_BY_TYPE: Record<TrailDocType, string> = {
  QT: '/quotations',
  SO: '/sales-orders',
  MO: '/manufacturing-orders',
  PO: '/purchase-orders',
};

const LABEL_BY_TYPE: Record<TrailDocType, string> = {
  QT: 'Quotation',
  SO: 'Sales Order',
  MO: 'Manufacturing Order',
  PO: 'Purchase Order',
};

/**
 * Horizontal chain of clickable pill-boxes (SO → MO → PO), joined by arrows
 * (DESIGN.md §8). The current document is highlighted; the others link to their
 * module with a ?focus= deep link that opens that document's drawer.
 */
export function DocumentTrail({ nodes, currentId }: { nodes: TrailNode[]; currentId: string }) {
  const router = useRouter();
  const valid = nodes.filter((n) => n.id);

  if (valid.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Document Trail</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {valid.map((node, i) => {
          const isCurrent = node.id === currentId;
          return (
            <div key={node.id} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
              <button
                type="button"
                disabled={isCurrent}
                onClick={() => router.push(`${ROUTE_BY_TYPE[node.type]}?focus=${node.id}`)}
                title={`${LABEL_BY_TYPE[node.type]} ${node.id}`}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-left transition-colors',
                  isCurrent
                    ? 'border-primary bg-card ring-1 ring-primary/20'
                    : 'border-border bg-card hover:bg-accent cursor-pointer',
                )}
              >
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{node.type}</div>
                <div className="font-mono text-xs text-foreground">{node.id}</div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
