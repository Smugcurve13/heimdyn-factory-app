'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { formatPrice } from '@/lib/erp/selectors';
import { useErpStore } from '@/lib/erp/store';
import { useRole } from '@/lib/erp/roles';
import { Product, ProductType } from '@/lib/erp/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { StatusPill } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';

export default function ProductsPage() {
  const { can } = useRole();
  const store = useErpStore();
  const { products } = store;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const activeCount = products.filter((p) => p.status === 'Active').length;

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setFormOpen(true); };

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
      render: (p) => <StatusPill label={p.status} tone={p.status === 'Active' ? 'green' : 'neutral'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Product Master — every sellable, buildable pallet. {activeCount} of {products.length} active · USD pricing.
          </p>
        </div>
        {can('product:manage') && (
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      <ListDrawer<Product>
        rows={products}
        columns={columns}
        getRowId={(p) => p.id}
        searchPlaceholder="Search products…"
        searchFilter={(p, q) =>
          p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
        }
        renderDrawerTitle={(p) => p.name}
        renderDrawerSubtitle={(p) => <span className="font-mono">{p.id}</span>}
        renderDrawer={(p) => {
          const bom = store.getBom(p.id);
          return (
            <div className="space-y-5">
              <div>
                <DrawerField label="Code" value={<span className="font-mono">{p.id}</span>} />
                <DrawerField label="Type" value={p.type} />
                <DrawerField label="Unit Price" value={formatPrice(p.priceUsd)} mono />
                <DrawerField label="Finished Stock" value={`${p.finishedStock.toLocaleString('en-US')} units`} mono />
                <DrawerField label="Reorder Level" value={p.reorderLevel.toLocaleString('en-US')} mono />
                <DrawerField label="Recipe (BOM)" value={`${bom?.lines.length ?? 0} components`} mono />
                <DrawerField label="Status" value={<StatusPill label={p.status} tone={p.status === 'Active' ? 'green' : 'neutral'} />} />
              </div>
              {can('product:manage') && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button
                    variant={p.status === 'Active' ? 'outline' : 'default'}
                    className="flex-1"
                    onClick={() => store.toggleProductStatus(p.id)}
                  >
                    {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              )}
            </div>
          );
        }}
      />

      <ProductForm
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSave={(data) => {
          if (editing) store.updateProduct(editing.id, data);
          else store.addProduct({ ...data, finishedStock: data.finishedStock ?? 0 });
          setFormOpen(false);
        }}
      />
    </div>
  );
}

type ProductDraft = {
  name: string;
  type: ProductType;
  priceUsd: number;
  finishedStock: number;
  reorderLevel: number;
  status: 'Active' | 'Inactive';
};

function ProductForm({
  open,
  product,
  onClose,
  onSave,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (data: ProductDraft) => void;
}) {
  const isEdit = !!product;
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('New Pallet');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [reorder, setReorder] = useState('');

  // Sync form fields when opening (add = blank, edit = prefilled).
  const [syncKey, setSyncKey] = useState('');
  const key = `${open}-${product?.id ?? 'new'}`;
  if (key !== syncKey) {
    setSyncKey(key);
    setName(product?.name ?? '');
    setType(product?.type ?? 'New Pallet');
    setPrice(product ? String(product.priceUsd) : '');
    setStock(product ? String(product.finishedStock) : '0');
    setReorder(product ? String(product.reorderLevel) : '');
  }

  const valid = name.trim() !== '' && Number(price) > 0 && Number(reorder) >= 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md border-border bg-popover">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${product?.id}` : 'Add Product'}</DialogTitle>
          <DialogDescription>USD pricing · pallets only</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Euro Pallet …" />
          </Field>
          <Field label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="New Pallet">New Pallet</option>
              <option value="Recycled Pallet">Recycled Pallet</option>
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Price (USD)">
              <Input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="font-mono" />
            </Field>
            <Field label="Stock">
              <Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="font-mono" />
            </Field>
            <Field label="Reorder">
              <Input type="number" min={0} value={reorder} onChange={(e) => setReorder(e.target.value)} className="font-mono" />
            </Field>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSave({
                name: name.trim(),
                type,
                priceUsd: Number(price),
                finishedStock: Number(stock) || 0,
                reorderLevel: Number(reorder),
                status: product?.status ?? 'Active',
              })
            }
          >
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
