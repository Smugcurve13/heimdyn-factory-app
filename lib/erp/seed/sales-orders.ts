import { SalesOrder } from '../types';

/**
 * Sales Orders (SO-2xxx). System-created only — never raised by hand (SOW §6 golden rule).
 * Each one points back to the quotation that produced it, and to the manufacturing
 * order behind it on Path B (null on Path A / ex-stock).
 */
export const salesOrders: SalesOrder[] = [
  {
    id: 'SO-2001',
    customerId: 'CUS-601',
    date: '2026-03-20',
    stage: 'Invoiced',
    productId: 'PRD-101',
    quantity: 1000,
    valueUsd: 18500,
    sourceQuotation: 'QT-1001',
    sourceMO: 'MO-3001',
  },
  {
    id: 'SO-2003',
    customerId: 'CUS-603',
    date: '2026-05-15',
    stage: 'Dispatched',
    productId: 'PRD-107',
    quantity: 200,
    valueUsd: 1800,
    sourceQuotation: 'QT-1003',
    sourceMO: null,
  },
  {
    id: 'SO-2004',
    customerId: 'CUS-604',
    date: '2026-04-30',
    stage: 'Confirmed',
    productId: 'PRD-103',
    quantity: 800,
    valueUsd: 16800,
    sourceQuotation: 'QT-1004',
    sourceMO: 'MO-3003',
  },
];
