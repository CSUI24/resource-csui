import type { ReactNode } from "react";

export function EmptyState({ label, action }: { label: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border bg-background text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      {action}
    </div>
  );
}
