'use client';

import { products, boms } from '@/lib/erp/seed';
import { getMaterial } from '@/lib/erp/selectors';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';
import { DrawerField } from '@/components/erp/DrawerField';

interface BomRow {
  productId: string;
  productName: string;
  type: string;
  componentCount: number;
}

export default function BomPage() {
  const rows: BomRow[] = products.map((p) => {
    const bom = boms.find((b) => b.productId === p.id);
    return {
      productId: p.id,
      productName: p.name,
      type: p.type,
      componentCount: bom?.lines.length ?? 0,
    };
  });

  const columns: ListDrawerColumn<BomRow>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (r) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{r.productId}</div>
          <div className="text-foreground">{r.productName}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (r) => r.type },
    {
      key: 'components',
      header: 'Components',
      align: 'right',
      mono: true,
      render: (r) => String(r.componentCount),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bill of Materials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The fixed recipe for each product — materials and quantities to build one pallet.
        </p>
      </div>

      <ListDrawer<BomRow>
        rows={rows}
        columns={columns}
        getRowId={(r) => r.productId}
        searchPlaceholder="Search products…"
        searchFilter={(r, q) => r.productName.toLowerCase().includes(q) || r.productId.toLowerCase().includes(q)}
        renderDrawerTitle={(r) => r.productName}
        renderDrawerSubtitle={(r) => (
          <span className="font-mono">{r.productId}</span>
        )}
        renderDrawer={(r) => {
          const bom = boms.find((b) => b.productId === r.productId);
          return (
            <div className="space-y-4">
              <DrawerField label="Components" value={`${r.componentCount} materials per unit`} mono />
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card">
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Material
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Qty / Unit
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        UoM
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom?.lines.map((line, i) => {
                      const mat = getMaterial(line.materialId);
                      return (
                        <tr key={line.materialId} className={i % 2 === 1 ? 'bg-card/50' : undefined}>
                          <td className="px-3 py-2 text-foreground">
                            <div className="font-mono text-xs text-muted-foreground">{line.materialId}</div>
                            <div>{mat?.name ?? '—'}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-foreground">{line.qtyPerUnit}</td>
                          <td className="px-3 py-2 text-muted-foreground">{mat?.uom ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Recipes are fixed per product in Phase 2 (custom-dimension recipes are out of scope).
              </p>
            </div>
          );
        }}
      />
    </div>
  );
}
