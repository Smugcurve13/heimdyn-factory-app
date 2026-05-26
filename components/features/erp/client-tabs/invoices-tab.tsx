'use client';

import type { Invoice } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Eye, Send } from 'lucide-react';

const statusStyle: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Overdue: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function ClientInvoicesTab({ invoices }: { invoices: Invoice[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.invoiceId}>
            <TableCell className="font-medium">{inv.invoiceId}</TableCell>
            <TableCell>{formatDate(inv.date)}</TableCell>
            <TableCell className="text-right">{formatCurrency(inv.amount)}</TableCell>
            <TableCell>{formatDate(inv.dueDate)}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={statusStyle[inv.status] ?? ''}>
                {inv.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <TooltipProvider>
                <div className="flex items-center justify-end gap-1">
                  {[
                    { icon: <Eye className="h-3.5 w-3.5" />, label: 'View' },
                    { icon: <Download className="h-3.5 w-3.5" />, label: 'Download' },
                    { icon: <Send className="h-3.5 w-3.5" />, label: 'Send' },
                  ].map((action) => (
                    <Tooltip key={action.label}>
                      <TooltipTrigger asChild>
                        <span>
                          <Button variant="ghost" size="icon" disabled className="h-7 w-7">
                            {action.icon}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Coming soon</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
