'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Metric {
  label: string;
  value: string;
}

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function DetailHeader({
  title,
  subtitle,
  backHref,
  status,
  metadata,
  metrics,
  actions,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  status: string;
  metadata: { label: string; value: string }[];
  metrics: Metric[];
  actions: ActionButton[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push(backHref)}
        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-lg font-bold text-blue-600 dark:text-blue-400">
              {title.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            {metadata.map((m) => (
              <span key={m.label}>
                {m.label}: <span className="font-medium text-slate-700 dark:text-slate-200">{m.value}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {actions.map((action) =>
              action.disabled ? (
                <Tooltip key={action.label}>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="outline" size="sm" disabled className="gap-1.5">
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
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="gap-1.5"
                >
                  {action.icon}
                  {action.label}
                </Button>
              )
            )}
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
