import { Quotation } from '../types';

/**
 * Quotations (QT-1xxx). The starting point of every sale.
 *
 * Interlinked chains (see lib/erp/seed/index.ts for the full family tree):
 *  - QT-1001 → MO-3001 → [PO-4001, PO-4002] → SO-2001   (Path B, completed)
 *  - QT-1003 → SO-2003                                  (Path A, ex-stock)
 *  - QT-1004 → MO-3003 → [PO-4003] → SO-2004            (Path B, mid-flight)
 *
 * QT-1002 is the Phase 5 demo trigger: it starts at "Pending Approval" and is
 * short on stock, so approving it later spins up the full cascade in-session.
 * The rest (QT-1005..QT-1008) populate the Kanban board across stages.
 */
export const quotations: Quotation[] = [
  {
    id: 'QT-1001',
    customerId: 'CUS-601',
    date: '2026-03-04',
    stage: 'Sales Order Raised',
    stockShort: true,
    lines: [{ productId: 'PRD-101', quantity: 1000, unitPriceUsd: 18.5 }],
    linkedMO: 'MO-3001',
    linkedSO: 'SO-2001',
    invoice: { number: 'INV-1001', date: '2026-03-05' },
  },
  {
    id: 'QT-1002',
    customerId: 'CUS-602',
    date: '2026-05-28',
    stage: 'Pending Approval',
    stockShort: true,
    lines: [{ productId: 'PRD-102', quantity: 500, unitPriceUsd: 24.0 }],
    linkedMO: null,
    linkedSO: null,
  },
  {
    id: 'QT-1003',
    customerId: 'CUS-603',
    date: '2026-05-12',
    stage: 'Sales Order Raised',
    stockShort: false,
    lines: [{ productId: 'PRD-107', quantity: 200, unitPriceUsd: 9.0 }],
    linkedMO: null,
    linkedSO: 'SO-2003',
    invoice: { number: 'INV-1003', date: '2026-05-13' },
  },
  {
    id: 'QT-1004',
    customerId: 'CUS-604',
    date: '2026-04-22',
    stage: 'Sales Order Raised',
    stockShort: true,
    lines: [{ productId: 'PRD-103', quantity: 800, unitPriceUsd: 21.0 }],
    linkedMO: 'MO-3003',
    linkedSO: 'SO-2004',
    invoice: { number: 'INV-1004', date: '2026-04-23' },
  },
  {
    id: 'QT-1005',
    customerId: 'CUS-605',
    date: '2026-05-30',
    stage: 'Draft',
    stockShort: false,
    lines: [{ productId: 'PRD-104', quantity: 300, unitPriceUsd: 16.75 }],
    linkedMO: null,
    linkedSO: null,
  },
  {
    id: 'QT-1006',
    customerId: 'CUS-606',
    date: '2026-05-26',
    stage: 'Pending Approval',
    stockShort: false,
    lines: [{ productId: 'PRD-105', quantity: 450, unitPriceUsd: 12.5 }],
    linkedMO: null,
    linkedSO: null,
  },
  {
    id: 'QT-1007',
    customerId: 'CUS-607',
    date: '2026-05-20',
    stage: 'Proforma Invoice',
    stockShort: true,
    lines: [{ productId: 'PRD-110', quantity: 150, unitPriceUsd: 27.5 }],
    linkedMO: null,
    linkedSO: null,
    invoice: { number: 'INV-1007', date: '2026-05-21' },
  },
  {
    id: 'QT-1008',
    customerId: 'CUS-608',
    date: '2026-05-18',
    stage: 'Draft',
    stockShort: false,
    lines: [{ productId: 'PRD-108', quantity: 260, unitPriceUsd: 10.5 }],
    linkedMO: null,
    linkedSO: null,
  },
];
