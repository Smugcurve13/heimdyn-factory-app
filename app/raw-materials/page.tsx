'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useErpStore } from '@/lib/erp/store';
import { useRole } from '@/lib/erp/roles';
import { RawMaterial, UnitOfMeasure } from '@/lib/erp/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { StatusPill } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';

const UOMS: UnitOfMeasure[] = ['metres', 'units', 'kilograms', 'gallons'];
const statusOf = (m: RawMaterial) => m.status ?? 'Active';

export default function RawMaterialsPage() {
  const { can } = useRole();
  const store = useErpStore();
  const { rawMaterials } = store;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (m: RawMaterial) => { setEditing(m); setFormOpen(true); };

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
    { key: 'uom', header: 'Unit', render: (m) => m.uom },
    { key: 'stock', header: 'On Hand', align: 'right', mono: true, render: (m) => m.stock.toLocaleString('en-US') },
    { key: 'reorder', header: 'Reorder', align: 'right', mono: true, render: (m) => m.reorderLevel.toLocaleString('en-US') },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <StatusPill label={statusOf(m)} tone={statusOf(m) === 'Active' ? 'green' : 'neutral'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Raw Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Raw Material Master — everything consumed in production. {rawMaterials.length} materials tracked.
          </p>
        </div>
        {can('product:manage') && (
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Add Material
          </Button>
        )}
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
          <div className="space-y-5">
            <div>
              <DrawerField label="Code" value={<span className="font-mono">{m.id}</span>} />
              <DrawerField label="Unit of Measure" value={m.uom} />
              <DrawerField label="On Hand" value={`${m.stock.toLocaleString('en-US')} ${m.uom}`} mono />
              <DrawerField label="Reorder Level" value={`${m.reorderLevel.toLocaleString('en-US')} ${m.uom}`} mono />
              <DrawerField label="Status" value={<StatusPill label={statusOf(m)} tone={statusOf(m) === 'Active' ? 'green' : 'neutral'} />} />
            </div>
            {can('product:manage') && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(m)}>Edit</Button>
                <Button
                  variant={statusOf(m) === 'Active' ? 'outline' : 'default'}
                  className="flex-1"
                  onClick={() => store.toggleMaterialStatus(m.id)}
                >
                  {statusOf(m) === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Stock rises via goods receipt and manual top-up in Inventory.</p>
          </div>
        )}
      />

      <MaterialForm
        open={formOpen}
        material={editing}
        onClose={() => setFormOpen(false)}
        onSave={(data) => {
          if (editing) store.updateMaterial(editing.id, data);
          else store.addMaterial(data);
          setFormOpen(false);
        }}
      />
    </div>
  );
}

type MaterialDraft = { name: string; uom: UnitOfMeasure; stock: number; reorderLevel: number };

function MaterialForm({
  open,
  material,
  onClose,
  onSave,
}: {
  open: boolean;
  material: RawMaterial | null;
  onClose: () => void;
  onSave: (data: MaterialDraft) => void;
}) {
  const isEdit = !!material;
  const [name, setName] = useState('');
  const [uom, setUom] = useState<UnitOfMeasure>('units');
  const [stock, setStock] = useState('');
  const [reorder, setReorder] = useState('');

  const [syncKey, setSyncKey] = useState('');
  const key = `${open}-${material?.id ?? 'new'}`;
  if (key !== syncKey) {
    setSyncKey(key);
    setName(material?.name ?? '');
    setUom(material?.uom ?? 'units');
    setStock(material ? String(material.stock) : '0');
    setReorder(material ? String(material.reorderLevel) : '');
  }

  const valid = name.trim() !== '' && Number(stock) >= 0 && Number(reorder) >= 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md border-border bg-popover">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${material?.id}` : 'Add Material'}</DialogTitle>
          <DialogDescription>Consumed in pallet production</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pine Plank 2×4" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Unit</label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value as UnitOfMeasure)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {UOMS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">On Hand</label>
              <Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reorder</label>
              <Input type="number" min={0} value={reorder} onChange={(e) => setReorder(e.target.value)} className="font-mono" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() => onSave({ name: name.trim(), uom, stock: Number(stock) || 0, reorderLevel: Number(reorder) })}
          >
            {isEdit ? 'Save changes' : 'Create material'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
