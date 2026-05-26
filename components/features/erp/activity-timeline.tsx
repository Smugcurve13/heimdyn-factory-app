'use client';

import type { ActivityEntry } from '@/services/api';
import { formatDate } from '@/lib/mock-data';

export function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  let lastDateLabel = '';

  return (
    <div className="space-y-1">
      {sorted.map((entry, i) => {
        const dateLabel = formatDate(entry.date);
        const showDate = dateLabel !== lastDateLabel;
        lastDateLabel = dateLabel;

        return (
          <div key={`${entry.date}-${i}`}>
            {showDate && (
              <p className="mb-1 mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 first:mt-0">
                {dateLabel}
              </p>
            )}
            <div className="flex items-start gap-3 rounded-lg px-2 py-1.5">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <p className="text-sm text-slate-700 dark:text-slate-300">{entry.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
