'use client';

import type { CustomerHealth, VendorPerformance } from '@/services/api';

const healthStyles: Record<string, string> = {
  Good: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'Delayed Payments': 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'Low Activity': 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  'High Value': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  Excellent: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Average: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  Delayed: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  Critical: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export function HealthBadge({ value }: { value: CustomerHealth | VendorPerformance }) {
  const style = healthStyles[value] ?? healthStyles['Average'];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {value}
    </span>
  );
}
