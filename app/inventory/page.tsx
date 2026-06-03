'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { stockStatus, formatPrice } from '@/lib/erp/selectors';
import { useErpStore } from '@/lib/erp/store';
import { Product, RawMaterial } from '@/lib/erp/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRole } from '@/lib/erp/roles';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { StatusPill, stockTone } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';

type Pool = 'finished' | 'raw';

export default function InventoryPage() {
  const { can } = useRole();
  const { products, rawMaterials, addMaterialStock } = useErpStore();
  const [pool, setPool] = useState<Pool>('finished');

  const rawRows = rawMaterials;
  const addStock = (id: string, qty: number) => addMaterialStock(id, qty);

  const finishedUnits = products.reduce((s, p) => s + p.finishedStock, 0);
  const lowOrOut = [
    ...products.map((p) => stockStatus(p.finishedStock, p.reorderLevel)),
    ...rawRows.map((m) => stockStatus(m.stock, m.reorderLevel)),
  ];
  const lowCount = lowOrOut.filter((s) => s === 'Low Stock').length;
  const outCount = lowOrOut.filter((s) => s === 'Out of Stock').length;

  const finishedColumns: ListDrawerColumn<Product>[] = [
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
      key: 'onhand',
      header: 'On Hand',
      align: 'right',
      mono: true,
      render: (p) => p.finishedStock.toLocaleString('en-US'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => {
        const s = stockStatus(p.finishedStock, p.reorderLevel);
        return <StatusPill label={s} tone={stockTone(s)} />;
      },
    },
  ];

  const rawColumns: ListDrawerColumn<RawMaterial>[] = [
    {
      key: 'material',
      header: 'Material',
      render: (m) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{m.id}</div>
          <div className="text-foreground">{m.name}</div>
        </div>
      ),
    },
    { key: 'uom', header: 'Unit', render: (m) => m.uom },
    {
      key: 'onhand',
      header: 'On Hand',
      align: 'right',
      mono: true,
      render: (m) => m.stock.toLocaleString('en-US'),
    },
    {
      key: 'reorder',
      header: 'Reorder',
      align: 'right',
      mono: true,
      render: (m) => m.reorderLevel.toLocaleString('en-US'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => {
        const s = stockStatus(m.stock, m.reorderLevel);
        return <StatusPill label={s} tone={stockTone(s)} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Two self-updating stock pools. Raw materials can be topped up manually.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Finished Goods" value={finishedUnits.toLocaleString('en-US')} hint="units in stock" />
        <SummaryCard label="Raw Materials" value={String(rawRows.length)} hint="tracked items" />
        <SummaryCard label="Low Stock" value={String(lowCount)} hint="at/below reorder" />
        <SummaryCard label="Out of Stock" value={String(outCount)} hint="needs attention" />
      </div>

      {/* Pool tabs */}
      <div className="inline-flex rounded-lg border border-border p-1">
        <TabButton active={pool === 'finished'} onClick={() => setPool('finished')}>
          Finished Goods
        </TabButton>
        <TabButton active={pool === 'raw'} onClick={() => setPool('raw')}>
          Raw Materials
        </TabButton>
      </div>

      {pool === 'finished' ? (
        <ListDrawer<Product>
          rows={products}
          columns={finishedColumns}
          getRowId={(p) => p.id}
          searchPlaceholder="Search products…"
          searchFilter={(p, q) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)}
          renderDrawerTitle={(p) => p.name}
          renderDrawerSubtitle={(p) => <span className="font-mono">{p.id}</span>}
          renderDrawer={(p) => {
            const s = stockStatus(p.finishedStock, p.reorderLevel);
            return (
              <div className="space-y-4">
                <div>
                  <DrawerField label="Code" value={<span className="font-mono">{p.id}</span>} />
                  <DrawerField label="Type" value={p.type} />
                  <DrawerField label="Unit Price" value={formatPrice(p.priceUsd)} mono />
                  <DrawerField label="On Hand" value={`${p.finishedStock.toLocaleString('en-US')} units`} mono />
                  <DrawerField label="Reorder Level" value={p.reorderLevel.toLocaleString('en-US')} mono />
                  <DrawerField label="Status" value={<StatusPill label={s} tone={stockTone(s)} />} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Finished goods rise when manufacturing completes and fall on dispatch. They are
                  not topped up manually.
                </p>
              </div>
            );
          }}
        />
      ) : (
        <ListDrawer<RawMaterial>
          rows={rawRows}
          columns={rawColumns}
          getRowId={(m) => m.id}
          searchPlaceholder="Search materials…"
          searchFilter={(m, q) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)}
          renderDrawerTitle={(m) => m.name}
          renderDrawerSubtitle={(m) => <span className="font-mono">{m.id}</span>}
          renderDrawer={(m) => {
            const s = stockStatus(m.stock, m.reorderLevel);
            return (
              <div className="space-y-5">
                <div>
                  <DrawerField label="Code" value={<span className="font-mono">{m.id}</span>} />
                  <DrawerField label="Unit of Measure" value={m.uom} />
                  <DrawerField label="On Hand" value={`${m.stock.toLocaleString('en-US')} ${m.uom}`} mono />
                  <DrawerField label="Reorder Level" value={`${m.reorderLevel.toLocaleString('en-US')} ${m.uom}`} mono />
                  <DrawerField label="Status" value={<StatusPill label={s} tone={stockTone(s)} />} />
                </div>
                {can('inventory:addStock') && <AddStock uom={m.uom} onAdd={(qty) => addStock(m.id, qty)} />}
              </div>
            );
          }}
        />
      )}
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

/** Manual raw-material top-up. Updates in-session only (resets on refresh). */
function AddStock({ uom, onAdd }: { uom: string; onAdd: (qty: number) => void }) {
  const [value, setValue] = useState('');
  const qty = Number(value);
  const valid = value !== '' && !Number.isNaN(qty) && qty > 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Add Stock</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Top up raw material received outside the purchasing system.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Quantity (${uom})`}
          className="font-mono"
        />
        <Button
          type="button"
          disabled={!valid}
          onClick={() => {
            if (valid) {
              onAdd(qty);
              setValue('');
            }
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
