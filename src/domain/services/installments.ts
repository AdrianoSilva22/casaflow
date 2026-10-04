import { addMonths, format, parseISO } from "date-fns";
import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { InstallmentPlan, InstallmentPlanDraft } from "@/domain/entities/installment-plan";
import { resolveEntryStatus } from "@/domain/services/entry-status";

export function installmentAmount(total: number, count: number) {
  return Math.round((total / count) * 100) / 100;
}

export function buildInstallmentEntries(
  plan: InstallmentPlan,
  reference = new Date(),
): FinancialEntryDraft[] {
  return Array.from({ length: plan.installmentCount }, (_, index) => {
    const number = index + 1;
    const due = addMonths(parseISO(`${plan.firstDueDate}T12:00:00`), index);
    const dueDate = format(due, "yyyy-MM-dd");
    const isPast = due < reference;
    const status = isPast ? "paid" : "pending";

    return {
      name: plan.name,
      description: `${plan.description || plan.name} · parcela ${number}/${plan.installmentCount}`,
      amount: plan.installmentAmount,
      dueDate,
      paymentDate: status === "paid" ? dueDate : null,
      type: "expense",
      status,
      responsible: plan.responsible,
      category: plan.category,
      notes: "",
      commitmentKind: "installment",
      recurringExpenseId: null,
      installmentPlanId: plan.id,
      installmentNumber: number,
      installmentCount: plan.installmentCount,
    };
  });
}

export function installmentLabel(entry: Pick<FinancialEntry, "installmentNumber" | "installmentCount">) {
  if (!entry.installmentNumber || !entry.installmentCount) return null;
  return `${entry.installmentNumber}/${entry.installmentCount}`;
}

export interface InstallmentPlanSummary extends InstallmentPlan {
  currentNumber: number;
  remainingCount: number;
  remainingAmount: number;
  paidCount: number;
}

export function summarizePlan(
  plan: InstallmentPlan,
  entries: FinancialEntry[],
  reference = new Date(),
): InstallmentPlanSummary {
  const related = entries
    .filter((entry) => entry.installmentPlanId === plan.id)
    .map((entry) => ({ ...entry, status: resolveEntryStatus(entry, reference) }))
    .sort((a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0));

  const paidCount = related.filter((entry) => entry.status === "paid").length;
  const remaining = related.filter((entry) => entry.status !== "paid" && entry.status !== "cancelled");
  const current = remaining[0] ?? related[related.length - 1];

  return {
    ...plan,
    status: remaining.length === 0 ? "closed" : "active",
    currentNumber: current?.installmentNumber ?? plan.installmentCount,
    remainingCount: remaining.length,
    remainingAmount: Math.round(remaining.reduce((sum, entry) => sum + entry.amount, 0) * 100) / 100,
    paidCount,
  };
}

export function createPlanFromDraft(draft: InstallmentPlanDraft, id: string, now = new Date().toISOString()): InstallmentPlan {
  return {
    ...draft,
    id,
    installmentAmount: draft.installmentAmount || installmentAmount(draft.totalAmount, draft.installmentCount),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}
