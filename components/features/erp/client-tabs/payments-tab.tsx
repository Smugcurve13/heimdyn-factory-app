'use client';

import type { Payment, Invoice } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/features/erp/stat-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusStyle: Record<string, string> = {
  Completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function ClientPaymentsTab({
  payments,
  invoices,
}: {
  payments: Payment[];
  invoices: Invoice[];
}) {
  const totalPaid = payments
    .filter((p) => p.status === 'Completed')
    .reduce((s, p) => s + p.amount, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Paid" value={formatCurrency(totalPaid)} />
        <StatCard title="Pending Amount" value={formatCurrency(pendingAmount)} />
        <StatCard title="Avg Payment Delay" value="3 days" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference ID</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p, i) => (
            <TableRow key={`${p.referenceId}-${i}`}>
              <TableCell>{formatDate(p.date)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(p.amount)}</TableCell>
              <TableCell>{p.method}</TableCell>
              <TableCell className="font-mono text-xs">{p.referenceId}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusStyle[p.status] ?? ''}>
                  {p.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
