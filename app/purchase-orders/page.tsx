'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMaterial, getVendor, formatUsd } from '@/lib/erp/selectors';
import { useErpStore } from '@/lib/erp/store';
import { PurchaseOrder } from '@/lib/erp/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { StatusPill, statusTone } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';
import { DocumentTrail, TrailNode } from '@/components/erp/DocumentTrail';

export default function PurchaseOrdersPage() {
  return (
    <Suspense fallback={null}>
      <PurchaseOrders />
    </Suspense>
  );
}

function PurchaseOrders() {
  const store = useErpStore();
  const focus = useSearchParams().get('focus');
  const { purchaseOrders } = store;

  const openOrders = purchaseOrders.filter((po) => po.stage !== 'Goods Received');
  const pendingValue = openOrders.reduce((s, po) => s + po.valueUsd, 0);

  const columns: ListDrawerColumn<PurchaseOrder>[] = [
    { key: 'id', header: 'PO', mono: true, render: (po) => po.id },
    { key: 'vendor', header: 'Vendor', render: (po) => getVendor(po.vendorId)?.name ?? po.vendorId },
    {
      key: 'material',
      header: 'Material',
      render: (po) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{po.materialId}</div>
          <div className="text-foreground">{getMaterial(po.materialId)?.name ?? '—'}</div>
        </div>
      ),
    },
    { key: 'qty', header: 'Qty', align: 'right', mono: true, render: (po) => po.quantity.toLocaleString('en-US') },
    { key: 'value', header: 'Value', align: 'right', mono: true, render: (po) => formatUsd(po.valueUsd) },
    { key: 'status', header: 'Status', render: (po) => <StatusPill label={po.stage} tone={statusTone(po.stage)} /> },
  ];

  const trailFor = (po: PurchaseOrder): TrailNode[] => {
    const mo = store.getManufacturingOrder(po.sourceMO);
    const so = mo?.sourceSO ? store.getSalesOrder(mo.sourceSO) : undefined;
    const nodes: TrailNode[] = [];
    if (so) nodes.push({ type: 'SO', id: so.id, status: so.stage });
    if (mo) nodes.push({ type: 'MO', id: mo.id, status: mo.stage });
    nodes.push({ type: 'PO', id: po.id, status: po.stage });
    return nodes;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Purchase Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Material procurement, auto-raised from production shortfalls.
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryCard label="Open Orders" value={String(openOrders.length)} hint="not yet received" />
        <SummaryCard label="Pending Value" value={formatUsd(pendingValue)} hint="across open orders" />
        <SummaryCard label="Total Orders" value={String(purchaseOrders.length)} hint="all time" />
      </div>

      <ListDrawer<PurchaseOrder>
        rows={purchaseOrders}
        columns={columns}
        getRowId={(po) => po.id}
        autoOpenId={focus}
        searchPlaceholder="Search POs…"
        searchFilter={(po, q) =>
          po.id.toLowerCase().includes(q) ||
          po.materialId.toLowerCase().includes(q) ||
          (getVendor(po.vendorId)?.name.toLowerCase().includes(q) ?? false)
        }
        renderDrawerTitle={(po) => po.id}
        renderDrawerSubtitle={(po) => getVendor(po.vendorId)?.name ?? po.vendorId}
        renderDrawer={(po) => {
          const mat = getMaterial(po.materialId);
          return (
            <div className="space-y-5">
              <div>
                <DrawerField label="Vendor" value={getVendor(po.vendorId)?.name ?? po.vendorId} />
                <DrawerField
                  label="Material"
                  value={
                    <span>
                      <span className="font-mono">{po.materialId}</span> · {mat?.name}
                    </span>
                  }
                />
                <DrawerField label="Quantity" value={`${po.quantity.toLocaleString('en-US')} ${mat?.uom ?? ''}`} mono />
                <DrawerField label="Value" value={formatUsd(po.valueUsd)} mono />
                <DrawerField label="Status" value={<StatusPill label={po.stage} tone={statusTone(po.stage)} />} />
              </div>

              <GoodsReceipt po={po} store={store} />

              <DocumentTrail nodes={trailFor(po)} currentId={po.id} />
            </div>
          );
        }}
      />
    </div>
  );
}

function GoodsReceipt({ po, store }: { po: PurchaseOrder; store: ReturnType<typeof useErpStore> }) {
  const mat = getMaterial(po.materialId);
  const [value, setValue] = useState(String(po.quantity));

  if (po.stage === 'Pending Approval') {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Approval</p>
        <p className="mt-1 text-xs text-muted-foreground">Approve this order before goods can be received.</p>
        <Button className="mt-3 w-full" onClick={() => store.approvePurchaseOrder(po.id)}>
          Approve order
        </Button>
      </div>
    );
  }

  if (po.stage === 'Goods Received') {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Goods Receipt</p>
        <p className="mt-2 text-sm text-foreground">
          Received <span className="font-mono">{po.receivedQty.toLocaleString('en-US')}</span> {mat?.uom}.
        </p>
      </div>
    );
  }

  // Approved → can receive
  const qty = Number(value);
  const valid = value !== '' && !Number.isNaN(qty) && qty > 0;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Goods Receipt</p>
      <p className="mt-1 text-xs text-muted-foreground">Record the quantity received against this order.</p>
      <div className="mt-3 flex items-center gap-2">
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="font-mono"
          placeholder={`Quantity (${mat?.uom ?? ''})`}
        />
        <Button disabled={!valid} onClick={() => valid && store.confirmGoodsReceipt(po.id, qty)}>
          Confirm Receipt
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
