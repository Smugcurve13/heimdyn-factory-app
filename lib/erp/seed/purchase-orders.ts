import { PurchaseOrder } from '../types';

/**
 * Purchase Orders (PO-4xxx). Auto-raised when a manufacturing order is short on a
 * material (SOW §5.4). Each points back to the MO that triggered it.
 */
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-4001',
    date: '2026-03-09',
    stage: 'Goods Received',
    vendorId: 'VEN-501',
    materialId: 'RM-201',
    quantity: 5000,
    valueUsd: 7500,
    receivedQty: 5000,
    sourceMO: 'MO-3001',
  },
  {
    id: 'PO-4002',
    date: '2026-03-09',
    stage: 'Goods Received',
    vendorId: 'VEN-503',
    materialId: 'RM-205',
    quantity: 350,
    valueUsd: 1925,
    receivedQty: 350,
    sourceMO: 'MO-3001',
  },
  {
    id: 'PO-4003',
    date: '2026-04-26',
    stage: 'Approved',
    vendorId: 'VEN-502',
    materialId: 'RM-203',
    quantity: 4200,
    valueUsd: 18900,
    receivedQty: 0,
    sourceMO: 'MO-3003',
  },
  {
    id: 'PO-4005',
    date: '2026-05-25',
    stage: 'Pending Approval',
    vendorId: 'VEN-501',
    materialId: 'RM-202',
    quantity: 3000,
    valueUsd: 6000,
    receivedQty: 0,
    sourceMO: 'MO-3005',
  },
];
