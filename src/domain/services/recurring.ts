import { addMonths, endOfMonth, format, getDaysInMonth } from "date-fns";
import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";
import { resolveEntryStatus } from "@/domain/services/entry-status";

export function clampDueDay(year: number, monthIndex: number, dueDay: number) {
  return Math.min(dueDay, getDaysInMonth(new Date(year, monthIndex, 1)));
}

export function recurringDueDate(year: number, monthIndex: number, dueDay: number) {
  const day = clampDueDay(year, monthIndex, dueDay);
  return format(new Date(year, monthIndex, day, 12, 0, 0), "yyyy-MM-dd");
}

export function monthOccurrenceKey(recurringId: string, year: number, monthIndex: number) {
  return `${recurringId}:${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function buildRecurringEntry(
  recurring: RecurringExpense,
  year: number,
  monthIndex: number,
  reference = new Date(),
): FinancialEntryDraft {
  const dueDate = recurringDueDate(year, monthIndex, recurring.dueDay);
  const due = new Date(`${dueDate}T12:00:00`);
  const paid = due < reference;

  return {
    name: recurring.name,
    description: recurring.description,
    amount: recurring.amount,
    dueDate,
    paymentDate: paid ? dueDate : null,
    type: "expense",
    status: paid ? "paid" : "pending",
    responsible: recurring.responsible,
    category: recurring.category,
    notes: `Todo dia ${recurring.dueDay}`,
    commitmentKind: "recurring",
    recurringExpenseId: recurring.id,
    installmentPlanId: null,
    installmentNumber: null,
    installmentCount: null,
  };
}

export function hasOccurrence(
  entries: FinancialEntry[],
  recurringId: string,
  year: number,
  monthIndex: number,
) {
  const prefix = format(new Date(year, monthIndex, 1), "yyyy-MM");
  return entries.some(
    (entry) => entry.recurringExpenseId === recurringId && entry.dueDate.startsWith(prefix),
  );
}

export function missingRecurringEntries(
  recurring: RecurringExpense[],
  entries: FinancialEntry[],
  from: Date,
  to: Date,
  reference = new Date(),
): FinancialEntryDraft[] {
  const created: FinancialEntryDraft[] = [];

  for (const item of recurring.filter((recurringItem) => recurringItem.status === "active")) {
    let cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const limit = endOfMonth(to);

    while (cursor <= limit) {
      if (!hasOccurrence(entries, item.id, cursor.getFullYear(), cursor.getMonth())) {
        created.push(buildRecurringEntry(item, cursor.getFullYear(), cursor.getMonth(), reference));
      }
      cursor = addMonths(cursor, 1);
    }
  }

  return created;
}

export function resolveRecurringOccurrenceStatus(entry: FinancialEntry, today = new Date()) {
  return resolveEntryStatus(entry, today);
}
