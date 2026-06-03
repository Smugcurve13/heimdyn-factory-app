'use client';

import { useMemo, useState } from 'react';
import { products as seedProducts } from '@/lib/erp/seed';
import { formatPrice, getBom } from '@/lib/erp/selectors';
import { Product, ProductStatus } from '@/lib/erp/types';
import { Button } from '@/components/ui/button';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { StatusPill } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';

export default function ProductsPage() {
  // Status is mutable in-session (deactivate/activate); resets on refresh.
  const [statusById, setStatusById] = useState<Record<string, ProductStatus>>(() =>
    Object.fromEntries(seedProducts.map((p) => [p.id, p.status])),
  );

  const rows: Product[] = useMemo(
    () => seedProducts.map((p) => ({ ...p, status: statusById[p.id] })),
    [statusById],
  );

  const toggleStatus = (id: string) =>
    setStatusById((prev) => ({ ...prev, [id]: prev[id] === 'Active' ? 'Inactive' : 'Active' }));

  const activeCount = rows.filter((p) => p.status === 'Active').length;

  const columns: ListDrawerColumn<Product>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (p) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{p.id}</div>
          <div className="text-foreground">{p.name}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (p) => p.type },
    { key: 'price', header: 'Unit Price', align: 'right', mono: true, render: (p) => formatPrice(p.priceUsd) },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <StatusPill label={p.status} tone={p.status === 'Active' ? 'green' : 'neutral'} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Product Master — every sellable, buildable pallet. {activeCount} of {rows.length} active · USD pricing.
        </p>
      </div>

      <ListDrawer<Product>
        rows={rows}
        columns={columns}
        getRowId={(p) => p.id}
        searchPlaceholder="Search products…"
        searchFilter={(p, q) =>
          p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
        }
        renderDrawerTitle={(p) => p.name}
        renderDrawerSubtitle={(p) => <span className="font-mono">{p.id}</span>}
        renderDrawer={(p) => {
          const bom = getBom(p.id);
          return (
            <div className="space-y-5">
              <div>
                <DrawerField label="Code" value={<span className="font-mono">{p.id}</span>} />
                <DrawerField label="Type" value={p.type} />
                <DrawerField label="Unit Price" value={formatPrice(p.priceUsd)} mono />
                <DrawerField label="Reorder Level" value={p.reorderLevel.toLocaleString('en-US')} mono />
                <DrawerField label="Recipe (BOM)" value={`${bom?.lines.length ?? 0} components`} mono />
                <DrawerField
                  label="Status"
                  value={<StatusPill label={p.status} tone={p.status === 'Active' ? 'green' : 'neutral'} />}
                />
              </div>
              <Button
                variant={p.status === 'Active' ? 'outline' : 'default'}
                className="w-full"
                onClick={() => toggleStatus(p.id)}
              >
                {p.status === 'Active' ? 'Deactivate product' : 'Activate product'}
              </Button>
            </div>
          );
        }}
      />
    </div>
  );
}
