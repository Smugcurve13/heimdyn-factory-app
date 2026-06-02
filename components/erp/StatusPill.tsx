import { cn } from '@/lib/utils';

/** Pill tones, mapped to the status palette in DESIGN.md §4. */
export type PillTone = 'neutral' | 'amber' | 'yellow' | 'blue' | 'green' | 'red';

const TONE_CLASSES: Record<PillTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  blue: 'bg-blue-500/10 text-blue-300 border border-blue-400/20',
  green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  red: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export function StatusPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: PillTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Maps an inventory stock status to its pill tone. */
export function stockTone(status: string): PillTone {
  if (status === 'Out of Stock') return 'red';
  if (status === 'Low Stock') return 'amber';
  return 'green';
}
