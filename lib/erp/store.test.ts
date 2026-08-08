import { describe, expect, it } from 'vitest';
import { archiveRejectedQuotation, submitDraftQuotation, updateDraftQuotation } from './store';

const quotations = [
  {
    id: 'QT-1001',
    customerId: 'CUS-601',
    date: '2026-08-08',
    stage: 'Draft' as const,
    stockShort: false,
    lines: [{ productId: 'PRD-101', quantity: 1, unitPriceUsd: 10 }],
  },
  {
    id: 'QT-1002',
    customerId: 'CUS-602',
    date: '2026-08-08',
    stage: 'Pending Approval' as const,
    stockShort: false,
    lines: [{ productId: 'PRD-101', quantity: 1, unitPriceUsd: 10 }],
  },
];

const products = [{ id: 'PRD-101', finishedStock: 2 }];

describe('updateDraftQuotation', () => {
  it('updates a draft and recalculates its stock requirement', () => {
    const updated = updateDraftQuotation(quotations, 'QT-1001', 'CUS-603', [
      { productId: 'PRD-101', quantity: 3, unitPriceUsd: 10 },
    ], products);

    expect(updated[0]).toMatchObject({ customerId: 'CUS-603', stockShort: true });
    expect(updated[1]).toEqual(quotations[1]);
  });

  it('does not update a quotation after it leaves draft', () => {
    const updated = updateDraftQuotation(quotations, 'QT-1002', 'CUS-603', [
      { productId: 'PRD-101', quantity: 3, unitPriceUsd: 10 },
    ], products);

    expect(updated).toEqual(quotations);
  });
});

describe('submitDraftQuotation', () => {
  it('moves only a draft quotation to pending approval', () => {
    expect(submitDraftQuotation(quotations, 'QT-1001')[0]).toMatchObject({ stage: 'Pending Approval' });
    expect(submitDraftQuotation(quotations, 'QT-1002')).toEqual(quotations);
  });
});

describe('archiveRejectedQuotation', () => {
  it('removes a pending quotation and records its rejection reason', () => {
    const result = archiveRejectedQuotation(quotations, 'QT-1002', 'Pricing needs revision', '2026-08-08');

    expect(result.quotations).toEqual([quotations[0]]);
    expect(result.archived).toMatchObject({ id: 'QT-1002', rejectionReason: 'Pricing needs revision', rejectedAt: '2026-08-08' });
  });

  it('keeps a quotation when the reason is blank', () => {
    expect(archiveRejectedQuotation(quotations, 'QT-1002', '  ', '2026-08-08')).toEqual({ quotations, archived: null });
  });
});
