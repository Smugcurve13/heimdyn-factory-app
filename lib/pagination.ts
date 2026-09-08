export const PAGE_SIZES = [5, 10, 15, 20] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

export interface PaginatedItems<T> {
  items: T[];
  page: number;
  pageCount: number;
}

export function paginate<T>(items: T[], requestedPage: number, pageSize: number): PaginatedItems<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageCount,
  };
}
