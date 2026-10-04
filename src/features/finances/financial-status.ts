import type { EntryStatus, EntryType } from "@/domain/value-objects/enums";
import type { DisplayStatus } from "@/domain/value-objects/commitments";

export function statusTone(status: EntryStatus | DisplayStatus) {
  if (status === "paid") return "success" as const;
  if (status === "overdue") return "danger" as const;
  if (status === "pending") return "warning" as const;
  if (status === "future") return "info" as const;
  return "neutral" as const;
}

export function typeTone(type: EntryType) {
  return type === "income" ? ("info" as const) : ("primary" as const);
}

export function calendarDot(status: EntryStatus | DisplayStatus, type: EntryType) {
  if (type === "income") return "bg-sky-500";
  if (status === "paid") return "bg-emerald-500";
  if (status === "overdue") return "bg-rose-500";
  if (status === "future") return "bg-sky-500";
  return "bg-amber-400";
}
