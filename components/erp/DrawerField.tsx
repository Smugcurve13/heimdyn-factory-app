import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A labelled key/value row for detail drawers. */
export function DrawerField({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-2.5 last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn('text-right text-sm text-foreground', mono && 'font-mono')}>{value}</span>
    </div>
  );
}
