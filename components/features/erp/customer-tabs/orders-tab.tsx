'use client';

import { useState } from 'react';
import type { Order } from '@/services/api';
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
  Confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const deliveryStyle: Record<string, string> = {
  Delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'In Transit': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Returned: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const filters = ['All', 'Pending', 'Confirmed', 'Delivered'] as const;

export function CustomerOrdersTab({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All'
    ? orders
    : filter === 'Delivered'
      ? orders.filter((o) => o.deliveryStatus === 'Delivered')
      : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Delivery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-medium">{order.orderId}</TableCell>
              <TableCell>{formatDate(order.date)}</TableCell>
              <TableCell>{order.products}</TableCell>
              <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusStyle[order.status] ?? ''}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={deliveryStyle[order.deliveryStatus] ?? ''}>
                  {order.deliveryStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
