'use client';

import type { ProductPurchase } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ClientProductsTab({ products }: { products: ProductPurchase[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-center">Units Bought</TableHead>
          <TableHead className="text-right">Revenue Contribution</TableHead>
          <TableHead>Last Purchased</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.product}>
            <TableCell className="font-medium">{p.product}</TableCell>
            <TableCell className="text-center">{p.unitsBought.toLocaleString()}</TableCell>
            <TableCell className="text-right">{formatCurrency(p.revenueContribution)}</TableCell>
            <TableCell>{formatDate(p.lastPurchased)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
