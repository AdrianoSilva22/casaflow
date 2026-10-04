import {
  addDays,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import { withResolvedStatus } from "@/domain/services/entry-status";
import type { Category, Responsible } from "@/domain/value-objects/enums";
import { monthKey } from "@/lib/format";

export interface MonthTotal {
  key: string;
  year: number;
  month: number;
  income: number;
  expense: number;
  savings: number;
}

export interface DashboardSnapshot {
  currentBalance: number;
  monthIncome: number;
  monthExpense: number;
  openBills: number;
  overdueBills: number;
  upcomingBills: number;
  totalPaid: number;
  monthSavings: number;
  maxMonthExpense: MonthTotal | null;
  minMonthExpense: MonthTotal | null;
  mostEconomicalMonth: MonthTotal | null;
  mostExpensiveMonth: MonthTotal | null;
  monthlyAverage: number;
  yearlyAverage: number;
  accumulatedSavings: number;
  totalMoved: number;
  byResponsible: Record<Responsible, number>;
  monthlySeries: MonthTotal[];
  yearlySeries: { year: number; income: number; expense: number }[];
  categoryBreakdown: { category: Category; amount: number }[];
}

function isActive(entry: FinancialEntry) {
  return entry.status !== "cancelled";
}

function isPaid(entry: FinancialEntry) {
  return entry.status === "paid";
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function amountOf(entries: FinancialEntry[], type: FinancialEntry["type"]) {
  return roundMoney(
    entries
      .filter((entry) => entry.type === type && isActive(entry))
      .reduce((sum, entry) => sum + entry.amount, 0),
  );
}

export function buildMonthlySeries(entries: FinancialEntry[]): MonthTotal[] {
  const map = new Map<string, MonthTotal>();

  for (const entry of entries.filter(isActive)) {
    const date = new Date(entry.dueDate);
    const key = monthKey(date);
    const current = map.get(key) ?? {
      key,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      income: 0,
      expense: 0,
      savings: 0,
    };

    if (entry.type === "income") current.income += entry.amount;
    if (entry.type === "expense") current.expense += entry.amount;
    current.savings = current.income - current.expense;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function buildDashboardSnapshot(
  rawEntries: FinancialEntry[],
  reference = new Date(),
): DashboardSnapshot {
  const entries = rawEntries.map((entry) => withResolvedStatus(entry, reference));
  const monthStart = startOfMonth(reference);
  const monthEnd = endOfMonth(reference);
  const weekStart = startOfWeek(reference, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(reference, { weekStartsOn: 1 });

  const inMonth = entries.filter((entry) =>
    isWithinInterval(new Date(entry.dueDate), { start: monthStart, end: monthEnd }),
  );
  const paid = entries.filter(isPaid);
  const monthIncome = amountOf(inMonth, "income");
  const monthExpense = amountOf(
    inMonth.filter((entry) => entry.status !== "cancelled"),
    "expense",
  );

  const paidIncome = amountOf(paid, "income");
  const paidExpense = amountOf(paid, "expense");
  const monthlySeries = buildMonthlySeries(entries);
  const expenseMonths = monthlySeries.filter((item) => item.expense > 0);
  const maxMonthExpense = [...expenseMonths].sort((a, b) => b.expense - a.expense)[0] ?? null;
  const minMonthExpense = [...expenseMonths].sort((a, b) => a.expense - b.expense)[0] ?? null;
  const mostEconomicalMonth = [...monthlySeries].sort((a, b) => b.savings - a.savings)[0] ?? null;
  const mostExpensiveMonth = [...monthlySeries].sort((a, b) => a.savings - b.savings)[0] ?? null;

  const yearMonths = monthlySeries.filter((item) => item.year === reference.getFullYear());
  const yearExpense = yearMonths.reduce((sum, item) => sum + item.expense, 0);

  const yearlyMap = new Map<number, { year: number; income: number; expense: number }>();
  for (const item of monthlySeries) {
    const current = yearlyMap.get(item.year) ?? { year: item.year, income: 0, expense: 0 };
    current.income += item.income;
    current.expense += item.expense;
    yearlyMap.set(item.year, current);
  }

  const categoryMap = new Map<Category, number>();
  for (const entry of inMonth.filter((item) => item.type === "expense" && isActive(item))) {
    categoryMap.set(entry.category, (categoryMap.get(entry.category) ?? 0) + entry.amount);
  }

  const byResponsible: Record<Responsible, number> = {
    adriano: 0,
    adrielle: 0,
    both: 0,
  };

  for (const entry of inMonth.filter((item) => item.type === "expense" && isActive(item))) {
    byResponsible[entry.responsible] += entry.amount;
  }

  return {
    currentBalance: paidIncome - paidExpense,
    monthIncome,
    monthExpense,
    openBills: inMonth.filter((entry) => entry.type === "expense" && entry.status === "pending").length,
    overdueBills: entries.filter((entry) => entry.type === "expense" && entry.status === "overdue").length,
    upcomingBills: entries.filter(
      (entry) =>
        entry.type === "expense" &&
        entry.status === "pending" &&
        isWithinInterval(new Date(entry.dueDate), { start: weekStart, end: weekEnd }),
    ).length,
    totalPaid: paid.filter((entry) => {
      const date = entry.paymentDate ? new Date(entry.paymentDate) : new Date(entry.dueDate);
      return isWithinInterval(date, { start: monthStart, end: monthEnd }) && entry.type === "expense";
    }).reduce((sum, entry) => sum + entry.amount, 0),
    monthSavings: monthIncome - monthExpense,
    maxMonthExpense,
    minMonthExpense,
    mostEconomicalMonth,
    mostExpensiveMonth,
    monthlyAverage: expenseMonths.length ? expenseMonths.reduce((sum, item) => sum + item.expense, 0) / expenseMonths.length : 0,
    yearlyAverage: yearMonths.length ? yearExpense / Math.max(yearMonths.length, 1) : 0,
    accumulatedSavings: monthlySeries.reduce((sum, item) => sum + item.savings, 0),
    totalMoved: entries.filter(isActive).reduce((sum, entry) => sum + entry.amount, 0),
    byResponsible,
    monthlySeries,
    yearlySeries: [...yearlyMap.values()].sort((a, b) => a.year - b.year),
    categoryBreakdown: [...categoryMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export function entriesInRange(entries: FinancialEntry[], start: Date, end: Date) {
  return entries
    .map((entry) => withResolvedStatus(entry))
    .filter((entry) => isWithinInterval(new Date(entry.dueDate), { start, end }));
}

export function upcomingWindow(entries: FinancialEntry[], days = 7, reference = new Date()) {
  return entriesInRange(entries, reference, addDays(reference, days)).filter(
    (entry) => entry.status === "pending" || entry.status === "overdue",
  );
}

export function yearToDateExpense(entries: FinancialEntry[], reference = new Date()) {
  return amountOf(
    entries.filter((entry) =>
      isWithinInterval(new Date(entry.dueDate), { start: startOfYear(reference), end: reference }),
    ),
    "expense",
  );
}
