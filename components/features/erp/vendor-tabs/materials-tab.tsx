'use client';

import type { VendorMaterial } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function VendorMaterialsTab({ materials }: { materials: VendorMaterial[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Material</TableHead>
          <TableHead className="text-right">Unit Cost</TableHead>
          <TableHead>Last Purchased</TableHead>
          <TableHead className="text-center">MOQ</TableHead>
          <TableHead>Lead Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((m) => (
          <TableRow key={m.material}>
            <TableCell className="font-medium">{m.material}</TableCell>
            <TableCell className="text-right">{formatCurrency(m.unitCost)}</TableCell>
            <TableCell>{formatDate(m.lastPurchased)}</TableCell>
            <TableCell className="text-center">{m.moq.toLocaleString()}</TableCell>
            <TableCell>{m.leadTime}</TableCell>
          </TableRow>
        ))}
        {materials.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
              No materials found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
