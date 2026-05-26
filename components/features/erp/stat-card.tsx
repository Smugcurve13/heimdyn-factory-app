'use client';

import { cardShell } from '@/lib/styles';

export function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className={`${cardShell} p-5`}>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
