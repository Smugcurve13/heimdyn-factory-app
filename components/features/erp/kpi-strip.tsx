'use client';

import { cardShell, innerPanel } from '@/lib/styles';

interface KpiItem {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.title} className={`${cardShell} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.title}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {item.value}
              </p>
            </div>
            <div className={`${innerPanel} shrink-0 p-2.5 text-slate-600 dark:text-slate-300`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
