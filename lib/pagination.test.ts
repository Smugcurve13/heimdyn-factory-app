import { describe, expect, it } from 'vitest';
import { paginate, PAGE_SIZES } from './pagination';

describe('paginate', () => {
  it('uses the supported page-size choices', () => {
    expect(PAGE_SIZES).toEqual([5, 10, 15, 20]);
  });

  it('returns the selected page and clamps an out-of-range page', () => {
    const items = Array.from({ length: 12 }, (_, index) => index + 1);

    expect(paginate(items, 2, 5)).toEqual({ items: [6, 7, 8, 9, 10], page: 2, pageCount: 3 });
    expect(paginate(items, 99, 5)).toEqual({ items: [11, 12], page: 3, pageCount: 3 });
  });

  it('returns one empty page for an empty list', () => {
    expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pageCount: 1 });
  });
});
