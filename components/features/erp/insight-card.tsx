'use client';

import { cardShell } from '@/lib/styles';
import { formatCurrency } from '@/lib/mock-data';

interface InsightItem {
  name: string;
  revenue: number;
  orders: number;
}

export function InsightCard({ title, items }: { title: string; items: InsightItem[] }) {
  return (
    <div className={`${cardShell} p-5`}>
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/60"
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {item.name}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{formatCurrency(item.revenue)}</span>
              <span className="rounded-md bg-slate-200/60 px-1.5 py-0.5 dark:bg-slate-700/60">
                {item.orders} orders
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
