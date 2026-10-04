import { startOfDay } from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { EntryStatus } from "@/domain/value-objects/enums";

export function resolveEntryStatus(entry: FinancialEntry, today = new Date()): EntryStatus {
  if (entry.status === "paid" || entry.status === "cancelled") {
    return entry.status;
  }

  const due = startOfDay(new Date(entry.dueDate));
  const now = startOfDay(today);

  if (due < now) {
    return "overdue";
  }

  return "pending";
}

export function withResolvedStatus(entry: FinancialEntry, today = new Date()): FinancialEntry {
  return { ...entry, status: resolveEntryStatus(entry, today) };
}
