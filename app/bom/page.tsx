'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useErpStore } from '@/lib/erp/store';
import { useRole } from '@/lib/erp/roles';
import { BomLine, Product } from '@/lib/erp/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { DrawerField } from '@/components/erp/DrawerField';

export default function BomPage() {
  const store = useErpStore();
  const { products } = store;

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
    {
      key: 'components',
      header: 'Components',
      align: 'right',
      mono: true,
      render: (p) => String(store.getBom(p.id)?.lines.length ?? 0),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bill of Materials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The recipe for each product — materials and quantities to build one pallet. Editable per product.
        </p>
      </div>

      <ListDrawer<Product>
        rows={products}
        columns={columns}
        getRowId={(p) => p.id}
        searchPlaceholder="Search products…"
        searchFilter={(p, q) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)}
        renderDrawerTitle={(p) => p.name}
        renderDrawerSubtitle={(p) => <span className="font-mono">{p.id}</span>}
        renderDrawer={(p) => <BomEditor product={p} store={store} />}
      />
    </div>
  );
}

function BomEditor({ product, store }: { product: Product; store: ReturnType<typeof useErpStore> }) {
  const { can } = useRole();
  const editable = can('product:manage');
  const materials = store.rawMaterials.filter((m) => (m.status ?? 'Active') === 'Active');
  const saved = store.getBom(product.id)?.lines ?? [];

  const [draft, setDraft] = useState<BomLine[]>([]);
  const [syncKey, setSyncKey] = useState('');
  const key = product.id;
  if (key !== syncKey) {
    setSyncKey(key);
    setDraft(saved.map((l) => ({ ...l })));
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const setLine = (i: number, patch: Partial<BomLine>) =>
    setDraft((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-4">
      <DrawerField label="Components" value={`${draft.length} materials per unit`} mono />

      <div className="space-y-2">
        {draft.length === 0 && <p className="text-sm text-muted-foreground">No components yet.</p>}
        {draft.map((line, i) => {
          const mat = store.getMaterial(line.materialId);
          return (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
              {editable ? (
                <select
                  value={line.materialId}
                  onChange={(e) => setLine(i, { materialId: e.target.value })}
                  className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                >
                  <option value="">Select material…</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.uom})</option>
                  ))}
                </select>
              ) : (
                <span className="flex-1 text-sm text-foreground">
                  <span className="font-mono text-xs text-muted-foreground">{line.materialId}</span> {mat?.name}
                </span>
              )}
              {editable ? (
                <Input
                  type="number"
                  min={0}
                  step="0.05"
                  value={line.qtyPerUnit}
                  onChange={(e) => setLine(i, { qtyPerUnit: Number(e.target.value) })}
                  className="w-20 font-mono"
                />
              ) : (
                <span className="w-20 text-right font-mono text-sm text-foreground">{line.qtyPerUnit}</span>
              )}
              <span className="w-14 text-xs text-muted-foreground">{mat?.uom ?? ''}</span>
              {editable && (
                <Button variant="outline" size="icon" onClick={() => setDraft((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {editable && (
        <>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDraft((prev) => [...prev, { materialId: '', qtyPerUnit: 1 }])}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add component
          </Button>
          <Button
            className="w-full"
            disabled={!dirty || draft.some((l) => !l.materialId || l.qtyPerUnit <= 0)}
            onClick={() => store.setBomLines(product.id, draft)}
          >
            Save recipe
          </Button>
        </>
      )}
    </div>
  );
}
