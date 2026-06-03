'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProduct, getMaterial, getBom } from '@/lib/erp/selectors';
import { useErpStore } from '@/lib/erp/store';
import { ManufacturingOrder } from '@/lib/erp/types';
import { Button } from '@/components/ui/button';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { StatusPill, statusTone } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';
import { DocumentTrail, TrailNode } from '@/components/erp/DocumentTrail';

export default function ManufacturingOrdersPage() {
  return (
    <Suspense fallback={null}>
      <ManufacturingOrders />
    </Suspense>
  );
}

function ManufacturingOrders() {
  const store = useErpStore();
  const focus = useSearchParams().get('focus');
  const { manufacturingOrders } = store;

  const columns: ListDrawerColumn<ManufacturingOrder>[] = [
    { key: 'id', header: 'MO', mono: true, render: (mo) => mo.id },
    {
      key: 'product',
      header: 'Product',
      render: (mo) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{mo.productId}</div>
          <div className="text-foreground">{getProduct(mo.productId)?.name ?? '—'}</div>
        </div>
      ),
    },
    { key: 'qty', header: 'Target', align: 'right', mono: true, render: (mo) => mo.quantity.toLocaleString('en-US') },
    {
      key: 'progress',
      header: 'Progress',
      align: 'right',
      mono: true,
      render: (mo) => `${mo.completedQty.toLocaleString('en-US')} / ${mo.quantity.toLocaleString('en-US')}`,
    },
    { key: 'status', header: 'Status', render: (mo) => <StatusPill label={mo.stage} tone={statusTone(mo.stage)} /> },
  ];

  const trailFor = (mo: ManufacturingOrder): TrailNode[] => {
    const so = mo.sourceSO ? store.getSalesOrder(mo.sourceSO) : undefined;
    const nodes: TrailNode[] = [];
    if (so) nodes.push({ type: 'SO', id: so.id, status: so.stage });
    nodes.push({ type: 'MO', id: mo.id, status: mo.stage });
    mo.raisedPOs.forEach((poId) => {
      const po = store.getPurchaseOrder(poId);
      if (po) nodes.push({ type: 'PO', id: po.id, status: po.stage });
    });
    return nodes;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manufacturing Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Production planning with a live BOM material check and completion progress.
        </p>
      </div>

      <ListDrawer<ManufacturingOrder>
        rows={manufacturingOrders}
        columns={columns}
        getRowId={(mo) => mo.id}
        autoOpenId={focus}
        searchPlaceholder="Search MOs…"
        searchFilter={(mo, q) =>
          mo.id.toLowerCase().includes(q) ||
          mo.productId.toLowerCase().includes(q) ||
          (getProduct(mo.productId)?.name.toLowerCase().includes(q) ?? false)
        }
        renderDrawerTitle={(mo) => mo.id}
        renderDrawerSubtitle={(mo) => getProduct(mo.productId)?.name ?? mo.productId}
        renderDrawer={(mo) => <MoDrawer mo={mo} store={store} trail={trailFor(mo)} />}
      />
    </div>
  );
}

function MoDrawer({
  mo,
  store,
  trail,
}: {
  mo: ManufacturingOrder;
  store: ReturnType<typeof useErpStore>;
  trail: TrailNode[];
}) {
  const bom = getBom(mo.productId);
  const pct = mo.quantity > 0 ? Math.round((mo.completedQty / mo.quantity) * 100) : 0;

  // Materials this MO raised a PO for (by material id) → drives the "PO Raised" badge.
  const poMaterials = new Set(
    mo.raisedPOs.map((id) => store.getPurchaseOrder(id)?.materialId).filter(Boolean) as string[],
  );

  return (
    <div className="space-y-5">
      <div>
        <DrawerField label="Product" value={<span className="font-mono">{mo.productId}</span>} />
        <DrawerField label="Target" value={`${mo.quantity.toLocaleString('en-US')} units`} mono />
        <DrawerField label="Status" value={<StatusPill label={mo.stage} tone={statusTone(mo.stage)} />} />
      </div>

      {/* Progress */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-wide">Progress</span>
          <span className="font-mono text-foreground">
            {mo.completedQty.toLocaleString('en-US')} / {mo.quantity.toLocaleString('en-US')} ({pct}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* BOM breakdown */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">BOM Breakdown</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card">
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Material</th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Required</th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Available</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {bom?.lines.map((line, i) => {
                const mat = getMaterial(line.materialId);
                const required = line.qtyPerUnit * mo.quantity;
                const available = mat?.stock ?? 0;
                const sufficient = available >= required;
                return (
                  <tr key={line.materialId} className={i % 2 === 1 ? 'bg-card/50' : undefined}>
                    <td className="px-3 py-2 text-foreground">
                      <div className="font-mono text-xs text-muted-foreground">{line.materialId}</div>
                      <div>{mat?.name ?? '—'}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{required.toLocaleString('en-US')}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{available.toLocaleString('en-US')}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <StatusPill
                          label={sufficient ? 'Sufficient' : 'Insufficient'}
                          tone={sufficient ? 'green' : 'red'}
                        />
                        {!sufficient && poMaterials.has(line.materialId) && (
                          <span className="inline-flex items-center rounded-full border border-blue-400/25 bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-300">
                            PO Raised
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage actions */}
      <MoActions mo={mo} store={store} />

      <DocumentTrail nodes={trail} currentId={mo.id} />
    </div>
  );
}

function MoActions({ mo, store }: { mo: ManufacturingOrder; store: ReturnType<typeof useErpStore> }) {
  if (mo.stage === 'Pending Approval') {
    return (
      <Button className="w-full" onClick={() => store.approveManufacturingOrder(mo.id)}>
        Approve order
      </Button>
    );
  }
  if (mo.stage === 'Planned') {
    return (
      <Button className="w-full" onClick={() => store.advanceManufacturingOrder(mo.id)}>
        Start production (→ In Progress)
      </Button>
    );
  }
  if (mo.stage === 'In Progress') {
    return (
      <Button className="w-full" onClick={() => store.advanceManufacturingOrder(mo.id)}>
        Mark complete (→ Done)
      </Button>
    );
  }
  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center text-sm text-emerald-400">
      Production complete
    </div>
  );
}
