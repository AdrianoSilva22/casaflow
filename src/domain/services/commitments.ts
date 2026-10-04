import { addMonths, format, startOfMonth } from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { InstallmentPlan } from "@/domain/entities/installment-plan";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";
import { alertKind, isLastInstallment, resolveDisplayStatus } from "@/domain/services/display-status";
import { summarizePlan } from "@/domain/services/installments";
import { resolveEntryStatus } from "@/domain/services/entry-status";
import { monthKey } from "@/lib/format";

export interface CommitmentAlert {
  id: string;
  kind: "today" | "tomorrow" | "week" | "overdue" | "last";
  title: string;
  subtitle: string;
  amount: number;
  dueDate: string;
}

export interface FutureProjectionMonth {
  key: string;
  recurring: number;
  installments: number;
  total: number;
}

export interface CommitmentInsights {
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  predictedTotal: number;
  activePlans: number;
  remainingInstallments: number;
  futureCommitted: number;
  recurringCount: number;
  recurringMonthly: number;
  mostExpensiveInstallment: { name: string; amount: number } | null;
  nextInstallment: { name: string; amount: number; dueDate: string; label: string } | null;
  alerts: CommitmentAlert[];
  projection3: FutureProjectionMonth[];
  projection6: FutureProjectionMonth[];
  projection12: FutureProjectionMonth[];
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildCommitmentInsights(
  rawEntries: FinancialEntry[],
  plans: InstallmentPlan[],
  recurring: RecurringExpense[],
  reference = new Date(),
): CommitmentInsights {
  const entries = rawEntries.map((entry) => ({ ...entry, status: resolveEntryStatus(entry, reference) }));
  const monthPrefix = format(reference, "yyyy-MM");
  const inMonth = entries.filter((entry) => entry.dueDate.startsWith(monthPrefix) && entry.type === "expense");

  const paid = inMonth.filter((entry) => entry.status === "paid");
  const pending = inMonth.filter((entry) => entry.status === "pending");
  const overdue = entries.filter((entry) => entry.type === "expense" && entry.status === "overdue");

  const summaries = plans.map((plan) => summarizePlan(plan, entries, reference));
  const activeSummaries = summaries.filter((plan) => plan.status === "active");
  const unpaidInstallments = entries.filter(
    (entry) =>
      entry.commitmentKind === "installment" &&
      entry.status !== "paid" &&
      entry.status !== "cancelled",
  );

  const nextInstallment = [...unpaidInstallments].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const mostExpensive = [...activeSummaries].sort((a, b) => b.installmentAmount - a.installmentAmount)[0];
  const activeRecurring = recurring.filter((item) => item.status === "active");

  const alerts: CommitmentAlert[] = entries
    .filter((entry) => entry.type === "expense")
    .map((entry) => {
      const kind = alertKind(entry, reference);
      if (!kind) return null;
      const titles = {
        today: "Vence hoje",
        tomorrow: "Vence amanhã",
        week: "Próximos 7 dias",
        overdue: "Em atraso",
        last: "Última parcela",
      };
      return {
        id: entry.id,
        kind,
        title: titles[kind],
        subtitle: isLastInstallment(entry)
          ? `${entry.name} · ${entry.installmentNumber}/${entry.installmentCount}`
          : entry.name,
        amount: entry.amount,
        dueDate: entry.dueDate,
      };
    })
    .filter((item): item is CommitmentAlert => Boolean(item))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 8);

  const projection = (months: number) => buildProjection(entries, activeRecurring, reference, months);

  return {
    paidCount: paid.length,
    pendingCount: pending.length,
    overdueCount: overdue.length,
    paidAmount: roundMoney(paid.reduce((sum, entry) => sum + entry.amount, 0)),
    pendingAmount: roundMoney(pending.reduce((sum, entry) => sum + entry.amount, 0)),
    overdueAmount: roundMoney(overdue.reduce((sum, entry) => sum + entry.amount, 0)),
    predictedTotal: roundMoney(
      inMonth.filter((entry) => entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amount, 0),
    ),
    activePlans: activeSummaries.length,
    remainingInstallments: unpaidInstallments.length,
    futureCommitted: roundMoney(unpaidInstallments.reduce((sum, entry) => sum + entry.amount, 0)),
    recurringCount: activeRecurring.length,
    recurringMonthly: roundMoney(activeRecurring.reduce((sum, item) => sum + item.amount, 0)),
    mostExpensiveInstallment: mostExpensive
      ? { name: mostExpensive.name, amount: mostExpensive.installmentAmount }
      : null,
    nextInstallment: nextInstallment
      ? {
          name: nextInstallment.name,
          amount: nextInstallment.amount,
          dueDate: nextInstallment.dueDate,
          label: `${nextInstallment.installmentNumber}/${nextInstallment.installmentCount}`,
        }
      : null,
    alerts,
    projection3: projection(3),
    projection6: projection(6),
    projection12: projection(12),
  };
}

export function buildProjection(
  entries: FinancialEntry[],
  recurring: RecurringExpense[],
  reference: Date,
  months: number,
): FutureProjectionMonth[] {
  return Array.from({ length: months }, (_, index) => {
    const cursor = addMonths(startOfMonth(reference), index);
    const key = monthKey(cursor);
    const prefix = format(cursor, "yyyy-MM");
    const installmentTotal = entries
      .filter(
        (entry) =>
          entry.commitmentKind === "installment" &&
          entry.dueDate.startsWith(prefix) &&
          entry.status !== "cancelled",
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
    const recurringTotal = recurring.reduce((sum, item) => sum + item.amount, 0);
    return {
      key,
      recurring: roundMoney(recurringTotal),
      installments: roundMoney(installmentTotal),
      total: roundMoney(recurringTotal + installmentTotal),
    };
  });
}

export interface MonthSummary {
  month: string;
  paidCount: number;
  paidAmount: number;
  pendingCount: number;
  pendingAmount: number;
  overdueCount: number;
  overdueAmount: number;
  predictedTotal: number;
  items: Array<FinancialEntry & { displayStatus: ReturnType<typeof resolveDisplayStatus> }>;
  installments: FinancialEntry[];
  future: Array<FinancialEntry & { displayStatus: ReturnType<typeof resolveDisplayStatus> }>;
}

export function monthSummary(entries: FinancialEntry[], month: string, reference = new Date()): MonthSummary {
  const resolved = entries.map((entry) => ({
    ...entry,
    status: resolveEntryStatus(entry, reference),
    displayStatus: resolveDisplayStatus(entry, reference),
  }));
  const inMonth = resolved.filter((entry) => entry.dueDate.startsWith(month) && entry.type === "expense");
  const paid = inMonth.filter((entry) => entry.status === "paid");
  const pending = inMonth.filter((entry) => entry.status === "pending");
  const overdue = inMonth.filter((entry) => entry.status === "overdue");
  const future = inMonth.filter((entry) => entry.displayStatus === "future");
  const installments = inMonth.filter((entry) => entry.commitmentKind === "installment");

  return {
    month,
    paidCount: paid.length,
    paidAmount: roundMoney(paid.reduce((sum, entry) => sum + entry.amount, 0)),
    pendingCount: pending.length,
    pendingAmount: roundMoney(pending.reduce((sum, entry) => sum + entry.amount, 0)),
    overdueCount: overdue.length,
    overdueAmount: roundMoney(overdue.reduce((sum, entry) => sum + entry.amount, 0)),
    predictedTotal: roundMoney(inMonth.filter((entry) => entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amount, 0)),
    items: inMonth.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    installments,
    future,
  };
}
