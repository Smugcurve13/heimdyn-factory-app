'use client';

import { rawMaterials } from '@/lib/erp/seed';
import { RawMaterial } from '@/lib/erp/types';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { DrawerField } from '@/components/erp/DrawerField';

export default function RawMaterialsPage() {
  const columns: ListDrawerColumn<RawMaterial>[] = [
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
    { key: 'uom', header: 'Unit of Measure', render: (m) => m.uom },
    {
      key: 'stock',
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Raw Materials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Raw Material Master — everything consumed in production. {rawMaterials.length} materials tracked.
          Stock levels and top-ups live in Inventory.
        </p>
      </div>

      <ListDrawer<RawMaterial>
        rows={rawMaterials}
        columns={columns}
        getRowId={(m) => m.id}
        searchPlaceholder="Search materials…"
        searchFilter={(m, q) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)}
        renderDrawerTitle={(m) => m.name}
        renderDrawerSubtitle={(m) => <span className="font-mono">{m.id}</span>}
        renderDrawer={(m) => (
          <div>
            <DrawerField label="Code" value={<span className="font-mono">{m.id}</span>} />
            <DrawerField label="Unit of Measure" value={m.uom} />
            <DrawerField label="On Hand" value={`${m.stock.toLocaleString('en-US')} ${m.uom}`} mono />
            <DrawerField label="Reorder Level" value={`${m.reorderLevel.toLocaleString('en-US')} ${m.uom}`} mono />
          </div>
        )}
      />
    </div>
  );
}
