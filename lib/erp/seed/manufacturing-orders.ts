import { ManufacturingOrder } from '../types';

/**
 * Manufacturing Orders (MO-3xxx). Auto-created when a quotation is short on stock,
 * or created manually to build ahead (MO-3005 — no source quotation/SO).
 * raisedPOs lists the Purchase Orders this MO auto-raised for short materials.
 */
export const manufacturingOrders: ManufacturingOrder[] = [
  {
    id: 'MO-3001',
    date: '2026-03-08',
    stage: 'Done',
    productId: 'PRD-101',
    quantity: 1000,
    completedQty: 1000,
    sourceQuotation: 'QT-1001',
    sourceSO: 'SO-2001',
    raisedPOs: ['PO-4001', 'PO-4002'],
  },
  {
    id: 'MO-3003',
    date: '2026-04-25',
    stage: 'In Progress',
    productId: 'PRD-103',
    quantity: 800,
    completedQty: 320,
    sourceQuotation: 'QT-1004',
    sourceSO: 'SO-2004',
    raisedPOs: ['PO-4003'],
  },
  {
    id: 'MO-3005',
    date: '2026-05-24',
    stage: 'Planned',
    productId: 'PRD-104',
    quantity: 500,
    completedQty: 0,
    sourceQuotation: null,
    sourceSO: null,
    raisedPOs: ['PO-4005'],
  },
];
