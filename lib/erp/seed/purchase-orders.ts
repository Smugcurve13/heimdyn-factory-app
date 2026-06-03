import { PurchaseOrder } from '../types';

/**
 * Purchase Orders (PO-4xxx). Auto-raised when a manufacturing order is short on a
 * material (SOW §5.4). Each points back to the MO that triggered it, and its
 * material is one the MO is actually short on (see manufacturing-orders.ts).
 */
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-4001',
    date: '2026-03-09',
    stage: 'Goods Received',
    vendorId: 'VEN-502',
    materialId: 'RM-203',
    quantity: 6000,
    valueUsd: 27000,
    receivedQty: 6000,
    sourceMO: 'MO-3001',
  },
  {
    id: 'PO-4003',
    date: '2026-04-26',
    stage: 'Approved',
    vendorId: 'VEN-502',
    materialId: 'RM-203',
    quantity: 4500,
    valueUsd: 20250,
    receivedQty: 0,
    sourceMO: 'MO-3003',
  },
  {
    id: 'PO-4005',
    date: '2026-05-25',
    stage: 'Pending Approval',
    vendorId: 'VEN-501',
    materialId: 'RM-204',
    quantity: 1000,
    valueUsd: 9000,
    receivedQty: 0,
    sourceMO: 'MO-3005',
  },
  {
    id: 'PO-4006',
    date: '2026-05-25',
    stage: 'Pending Approval',
    vendorId: 'VEN-501',
    materialId: 'RM-209',
    quantity: 3500,
    valueUsd: 7000,
    receivedQty: 0,
    sourceMO: 'MO-3005',
  },
];
