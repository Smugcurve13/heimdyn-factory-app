interface ModulePlaceholderProps {
  title: string;
  phase: string;
  description: string;
}

/**
 * Phase 1 route stub. Every sidebar item routes to a real page; the full module
 * UI lands in the phase noted here. Styled per DESIGN.md (dark card, 1px border,
 * no shadow).
 */
export function ModulePlaceholder({ title, phase, description }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8">
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Arriving in {phase}
        </span>
        <p className="mt-4 max-w-prose text-sm text-muted-foreground">
          This module is part of the Heimdyn ERP Phase 2 build. The interface is delivered
          phase by phase against the build plan — this screen is a routed placeholder until
          then.
        </p>
      </div>
    </div>
  );
}
