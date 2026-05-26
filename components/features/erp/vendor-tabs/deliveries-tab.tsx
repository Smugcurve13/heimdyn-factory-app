'use client';

import type { Delivery } from '@/services/api';
import { formatDate } from '@/lib/mock-data';
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
  Delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'In Transit': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Delayed: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  Returned: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function VendorDeliveriesTab({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Shipment ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Delay</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((d) => (
          <TableRow key={d.shipmentId}>
            <TableCell className="font-medium">{d.shipmentId}</TableCell>
            <TableCell>{formatDate(d.date)}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={statusStyle[d.status] ?? ''}>
                {d.status}
              </Badge>
            </TableCell>
            <TableCell>{d.delay}</TableCell>
          </TableRow>
        ))}
        {deliveries.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
              No deliveries found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
