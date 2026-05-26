'use client';

import type { ActivityEntry } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/lib/mock-data';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

interface RelatedRecord {
  label: string;
  count: number;
}

export function DetailSidebar({
  recentActivity,
  quickActions,
  relatedRecords,
}: {
  recentActivity: ActivityEntry[];
  quickActions: QuickAction[];
  relatedRecords: RelatedRecord[];
}) {
  const recent = [...recentActivity]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recent.map((entry, i) => (
            <div key={`${entry.date}-${i}`} className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{entry.description}</p>
                <p className="text-[10px] text-slate-400">{formatDate(entry.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Quick Actions
        </h3>
        <TooltipProvider>
          <div className="space-y-1.5">
            {quickActions.map((action) =>
              action.disabled ? (
                <Tooltip key={action.label}>
                  <TooltipTrigger asChild>
                    <span className="block">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="w-full justify-start gap-2"
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Coming soon</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  key={action.label}
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className="w-full justify-start gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              )
            )}
          </div>
        </TooltipProvider>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Related Records
        </h3>
        <div className="space-y-1.5">
          {relatedRecords.map((record) => (
            <div
              key={record.label}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm"
            >
              <span className="text-slate-600 dark:text-slate-300">{record.label}</span>
              <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                {record.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
