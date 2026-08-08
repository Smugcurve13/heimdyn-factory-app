'use client';

import { useErpStore } from '@/lib/erp/store';
import { useRole } from '@/lib/erp/roles';
import { RejectedQuotation } from '@/lib/erp/types';
import { getCustomer, formatPrice } from '@/lib/erp/selectors';
import { DrawerField } from '@/components/erp/DrawerField';
import { ListDrawer, ListDrawerColumn } from '@/components/erp/ListDrawer';

const quoteTotal = (quotation: RejectedQuotation) =>
  quotation.lines.reduce((total, line) => total + line.quantity * line.unitPriceUsd, 0);

export default function RejectedQuotationsPage() {
  const { can } = useRole();
  const { rejectedQuotations, getProduct } = useErpStore();

  if (!can('demo:reset')) return null;

  const columns: ListDrawerColumn<RejectedQuotation>[] = [
    {
      key: 'quotation',
      header: 'Quotation',
      render: (quotation) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{quotation.id}</div>
          <div className="text-foreground">{getCustomer(quotation.customerId)?.name ?? quotation.customerId}</div>
        </div>
      ),
    },
    { key: 'reason', header: 'Reason', render: (quotation) => quotation.rejectionReason },
    { key: 'value', header: 'Value', align: 'right', mono: true, render: (quotation) => formatPrice(quoteTotal(quotation)) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Rejected Quotations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Admin archive of quotations rejected during approval.</p>
      </div>
      <ListDrawer
        rows={rejectedQuotations}
        columns={columns}
        getRowId={(quotation) => quotation.id}
        searchPlaceholder="Search rejected quotations…"
        searchFilter={(quotation, query) =>
          quotation.id.toLowerCase().includes(query)
          || quotation.rejectionReason.toLowerCase().includes(query)
          || (getCustomer(quotation.customerId)?.name ?? quotation.customerId).toLowerCase().includes(query)
        }
        emptyLabel="No rejected quotations."
        renderDrawerTitle={(quotation) => quotation.id}
        renderDrawerSubtitle={(quotation) => getCustomer(quotation.customerId)?.name ?? quotation.customerId}
        renderDrawer={(quotation) => (
          <div className="space-y-5">
            <div>
              <DrawerField label="Customer" value={getCustomer(quotation.customerId)?.name ?? quotation.customerId} />
              <DrawerField label="Date" value={quotation.date} mono />
              <DrawerField label="Rejected on" value={quotation.rejectedAt} mono />
              <DrawerField label="Reason" value={quotation.rejectionReason} />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Line Items</p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card">
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Product</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.lines.map((line, index) => (
                      <tr key={line.productId} className={index % 2 === 1 ? 'bg-card/50' : undefined}>
                        <td className="px-3 py-2 text-foreground">
                          <div className="font-mono text-xs text-muted-foreground">{line.productId}</div>
                          <div>{getProduct(line.productId)?.name ?? '—'}</div>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-foreground">{line.quantity.toLocaleString('en-US')}</td>
                        <td className="px-3 py-2 text-right font-mono text-foreground">{formatPrice(line.unitPriceUsd)}</td>
                        <td className="px-3 py-2 text-right font-mono text-foreground">{formatPrice(line.quantity * line.unitPriceUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border">
                      <td className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground" colSpan={3}>Total</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">{formatPrice(quoteTotal(quotation))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
