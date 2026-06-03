'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProduct, getCustomer, formatUsd } from '@/lib/erp/selectors';
import { useErpStore } from '@/lib/erp/store';
import { SalesOrder } from '@/lib/erp/types';
import { Button } from '@/components/ui/button';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { StatusPill, statusTone } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';
import { DocumentTrail, TrailNode } from '@/components/erp/DocumentTrail';

const SO_NEXT_LABEL: Record<string, string> = {
  Confirmed: 'Commit stock (→ Stock Committed)',
  'Stock Committed': 'Dispatch (→ Dispatched)',
  Dispatched: 'Invoice (→ Invoiced)',
};

export default function SalesOrdersPage() {
  return (
    <Suspense fallback={null}>
      <SalesOrders />
    </Suspense>
  );
}

function SalesOrders() {
  const store = useErpStore();
  const focus = useSearchParams().get('focus');
  const { salesOrders } = store;

  const columns: ListDrawerColumn<SalesOrder>[] = [
    { key: 'id', header: 'SO', mono: true, render: (so) => so.id },
    { key: 'customer', header: 'Customer', render: (so) => getCustomer(so.customerId)?.name ?? so.customerId },
    {
      key: 'product',
      header: 'Product',
      render: (so) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{so.productId}</div>
          <div className="text-foreground">{getProduct(so.productId)?.name ?? '—'}</div>
        </div>
      ),
    },
    { key: 'qty', header: 'Qty', align: 'right', mono: true, render: (so) => so.quantity.toLocaleString('en-US') },
    { key: 'value', header: 'Value', align: 'right', mono: true, render: (so) => formatUsd(so.valueUsd) },
    { key: 'status', header: 'Status', render: (so) => <StatusPill label={so.stage} tone={statusTone(so.stage)} /> },
  ];

  const trailFor = (so: SalesOrder): TrailNode[] => {
    const qt = so.sourceQuotation ? store.getQuotation(so.sourceQuotation) : undefined;
    const mo = so.sourceMO ? store.getManufacturingOrder(so.sourceMO) : undefined;
    const nodes: TrailNode[] = [];
    if (qt) nodes.push({ type: 'QT', id: qt.id, status: qt.stage });
    nodes.push({ type: 'SO', id: so.id, status: so.stage });
    if (mo) {
      nodes.push({ type: 'MO', id: mo.id, status: mo.stage });
      mo.raisedPOs.forEach((poId) => {
        const po = store.getPurchaseOrder(poId);
        if (po) nodes.push({ type: 'PO', id: po.id, status: po.stage });
      });
    }
    return nodes;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sales Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirmed business. Sales Orders are created by the system — never by hand.
        </p>
      </div>

      <ListDrawer<SalesOrder>
        rows={salesOrders}
        columns={columns}
        getRowId={(so) => so.id}
        autoOpenId={focus}
        searchPlaceholder="Search sales orders…"
        searchFilter={(so, q) =>
          so.id.toLowerCase().includes(q) ||
          (getCustomer(so.customerId)?.name.toLowerCase().includes(q) ?? false) ||
          (getProduct(so.productId)?.name.toLowerCase().includes(q) ?? false)
        }
        renderDrawerTitle={(so) => so.id}
        renderDrawerSubtitle={(so) => getCustomer(so.customerId)?.name ?? so.customerId}
        renderDrawer={(so) => (
          <div className="space-y-5">
            <div>
              <DrawerField label="Customer" value={getCustomer(so.customerId)?.name ?? so.customerId} />
              <DrawerField
                label="Product"
                value={
                  <span>
                    <span className="font-mono">{so.productId}</span> · {getProduct(so.productId)?.name}
                  </span>
                }
              />
              <DrawerField label="Quantity" value={`${so.quantity.toLocaleString('en-US')} units`} mono />
              <DrawerField label="Value" value={formatUsd(so.valueUsd)} mono />
              <DrawerField label="Status" value={<StatusPill label={so.stage} tone={statusTone(so.stage)} />} />
            </div>

            {so.stage === 'Invoiced' ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center text-sm text-emerald-400">
                Invoiced — order complete
              </div>
            ) : (
              <Button className="w-full" onClick={() => store.advanceSalesOrder(so.id)}>
                {SO_NEXT_LABEL[so.stage]}
              </Button>
            )}

            <DocumentTrail nodes={trailFor(so)} currentId={so.id} />
          </div>
        )}
      />
    </div>
  );
}
