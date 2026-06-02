'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export interface ListDrawerColumn<T> {
  /** Stable key for the column. */
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Monospace the cell (numbers, IDs) per DESIGN.md. */
  mono?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

export interface ListDrawerProps<T> {
  rows: T[];
  columns: ListDrawerColumn<T>[];
  getRowId: (row: T) => string;
  /** When provided, a search box appears and filters rows. */
  searchFilter?: (row: T, query: string) => boolean;
  searchPlaceholder?: string;
  /** Extra controls rendered next to the search box (e.g. status filter). */
  toolbar?: ReactNode;
  /** Drawer header + body for the selected row. */
  renderDrawerTitle: (row: T) => ReactNode;
  renderDrawerSubtitle?: (row: T) => ReactNode;
  renderDrawer: (row: T) => ReactNode;
  emptyLabel?: string;
}

/**
 * The one reusable list + drawer pattern (HANDOFF ground rule 3): a filterable
 * table on the left, a 480px detail drawer sliding in from the right when a row
 * is clicked. Parameterised by columns + drawer content.
 *
 * Selection is tracked by id (not the row object) so the drawer always reflects
 * the current row data — important when the parent mutates a row in-session.
 */
export function ListDrawer<T>({
  rows,
  columns,
  getRowId,
  searchFilter,
  searchPlaceholder = 'Search…',
  toolbar,
  renderDrawerTitle,
  renderDrawerSubtitle,
  renderDrawer,
  emptyLabel = 'No records found.',
}: ListDrawerProps<T>) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchFilter || !query.trim()) return rows;
    return rows.filter((r) => searchFilter(r, query.trim().toLowerCase()));
  }, [rows, query, searchFilter]);

  const selectedRow = selectedId ? rows.find((r) => getRowId(r) === selectedId) ?? null : null;

  return (
    <div className="space-y-4">
      {(searchFilter || toolbar) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchFilter && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-card">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground',
                    col.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => {
                const id = getRowId(row);
                return (
                  <tr
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={cn(
                      'cursor-pointer border-t border-border transition-colors hover:bg-accent',
                      i % 2 === 1 && 'bg-card/50',
                      selectedId === id && 'bg-accent',
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-2.5 text-foreground',
                          col.align === 'right' ? 'text-right' : 'text-left',
                          col.mono && 'font-mono',
                          col.className,
                        )}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={selectedRow !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-popover p-0 shadow-none sm:max-w-[480px]"
        >
          {selectedRow && (
            <div className="flex h-full flex-col">
              <div className="border-b border-border px-6 py-5">
                <div className="text-lg font-semibold text-foreground">
                  {renderDrawerTitle(selectedRow)}
                </div>
                {renderDrawerSubtitle && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {renderDrawerSubtitle(selectedRow)}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">{renderDrawer(selectedRow)}</div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
