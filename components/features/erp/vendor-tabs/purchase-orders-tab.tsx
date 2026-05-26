'use client';

import type { PurchaseOrder } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusStyle: Record<string, string> = {
  Approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function VendorPurchaseOrdersTab({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PO ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Material</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseOrders.map((po) => (
          <TableRow key={po.poId}>
            <TableCell className="font-medium">{po.poId}</TableCell>
            <TableCell>{formatDate(po.date)}</TableCell>
            <TableCell>{po.material}</TableCell>
            <TableCell className="text-center">{po.quantity.toLocaleString()}</TableCell>
            <TableCell className="text-right">{formatCurrency(po.amount)}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={statusStyle[po.status] ?? ''}>
                {po.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {purchaseOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              No purchase orders found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
