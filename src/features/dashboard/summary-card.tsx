import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardSummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger";
}) {
  const tones = {
    primary: "bg-primary/12 text-primary",
    secondary: "bg-secondary/15 text-cyan-700 dark:text-secondary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-amber-600 dark:text-warning",
    danger: "bg-danger/12 text-danger",
  };

  return (
    <Card className="min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-snug text-pretty text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-2 text-lg font-semibold tracking-tight break-words tabular sm:text-2xl">{value}</p>
          {hint ? <p className="mt-1 text-xs leading-snug text-pretty text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-2xl sm:size-11", tones[tone])}>
          <Icon className="size-4 sm:size-5" />
        </span>
      </div>
    </Card>
  );
}
