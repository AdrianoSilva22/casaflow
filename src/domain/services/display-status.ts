import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { DisplayStatus } from "@/domain/value-objects/commitments";
import { resolveEntryStatus } from "@/domain/services/entry-status";

export function resolveDisplayStatus(entry: FinancialEntry, today = new Date()): DisplayStatus {
  const status = resolveEntryStatus(entry, today);
  if (status === "paid" || status === "cancelled" || status === "overdue") {
    return status;
  }

  const due = startOfDay(new Date(`${entry.dueDate}T12:00:00`));
  const now = startOfDay(today);
  if (due > now) return "future";
  return "pending";
}

export function alertKind(entry: FinancialEntry, today = new Date()) {
  const status = resolveDisplayStatus(entry, today);
  if (status === "paid" || status === "cancelled") return null;

  if (status === "overdue") return "overdue" as const;
  if (isLastInstallment(entry)) return "last" as const;
  const days = differenceInCalendarDays(new Date(`${entry.dueDate}T12:00:00`), startOfDay(today));
  if (days === 0) return "today" as const;
  if (days === 1) return "tomorrow" as const;
  if (days > 1 && days <= 7) return "week" as const;
  return null;
}

export function isLastInstallment(entry: FinancialEntry) {
  return Boolean(
    entry.commitmentKind === "installment" &&
      entry.installmentNumber &&
      entry.installmentCount &&
      entry.installmentNumber === entry.installmentCount,
  );
}
