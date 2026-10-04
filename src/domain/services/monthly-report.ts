import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { InstallmentPlan } from "@/domain/entities/installment-plan";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";
import type { Responsible } from "@/domain/value-objects/enums";
import { AVAILABLE_MONTHS } from "@/constants/months";
import { formatMonthYear } from "@/lib/format";

export interface MonthlyReportItem {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  responsible: Responsible;
  category: string;
  kind: "recurring" | "installment" | "once";
  label: string;
  notes?: string;
}

export interface ResponsibleBreakdown {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface MonthlyReportGroup {
  items: MonthlyReportItem[];
  totalExpense: number;
  totalIncome: number;
  net: number;
}

export interface MonthOverviewItem {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyReportResult {
  month: string;
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  byResponsible: {
    adriano: ResponsibleBreakdown;
    adrielle: ResponsibleBreakdown;
    both: ResponsibleBreakdown;
  };
  groups: {
    recurring: MonthlyReportGroup;
    installments: MonthlyReportGroup;
    once: MonthlyReportGroup;
  };
  allItems: MonthlyReportItem[];
  timeline: MonthOverviewItem[];
}

function isIncomeText(text?: string | null): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower.includes("[receita]") || lower.includes("[income]") || lower.includes("receita");
}

function round(val: number) {
  return Math.round(val * 100) / 100;
}

export function buildMonthlyReport(
  month: string,
  plans: InstallmentPlan[],
  recurring: RecurringExpense[],
  entries: FinancialEntry[],
): MonthlyReportResult {
  const recurringItems: MonthlyReportItem[] = [];
  const installmentItems: MonthlyReportItem[] = [];
  const onceItems: MonthlyReportItem[] = [];

  // 1. Recorrentes vigentes no mês
  for (const item of recurring) {
    if (item.status === "inactive") continue;
    const startPrefix = item.startedAt ? item.startedAt.slice(0, 7) : "";
    const endPrefix = item.endedAt ? item.endedAt.slice(0, 7) : null;

    if (startPrefix && month < startPrefix) continue;
    if (endPrefix && month > endPrefix) continue;
    if (item.status === "closed" && endPrefix && month > endPrefix) continue;

    const isIncome = isIncomeText(item.description) || isIncomeText(item.name);
    recurringItems.push({
      id: `rec_${item.id}`,
      name: item.name,
      amount: item.amount,
      type: isIncome ? "income" : "expense",
      responsible: item.responsible,
      category: item.category,
      kind: "recurring",
      label: `Todo dia ${item.dueDay}`,
      notes: item.description
        ?.replace(/\[receita\]/gi, "")
        .replace(/\[income\]/gi, "")
        .trim(),
    });
  }

  // 2. Parcelamentos que vencem no mês
  const [tYear, tMonth] = month.split("-").map(Number);
  for (const plan of plans) {
    const [startYear, startMonth] = plan.firstDueDate.split("-").map(Number);
    const indexDiff = (tYear - startYear) * 12 + (tMonth - startMonth);

    if (indexDiff >= 0 && indexDiff < plan.installmentCount) {
      const parcelNumber = indexDiff + 1;
      const isIncome = isIncomeText(plan.description) || isIncomeText(plan.name);
      installmentItems.push({
        id: `plan_${plan.id}_${parcelNumber}`,
        name: plan.name,
        amount: plan.installmentAmount,
        type: isIncome ? "income" : "expense",
        responsible: plan.responsible,
        category: plan.category,
        kind: "installment",
        label: `Parcela ${parcelNumber}/${plan.installmentCount}`,
        notes: plan.description
          ?.replace(/\[receita\]/gi, "")
          .replace(/\[income\]/gi, "")
          .trim(),
      });
    }
  }

  // 3. Lançamentos avulsos cadastrados no mês
  for (const entry of entries) {
    if (entry.commitmentKind !== "once") continue;
    if (entry.status === "cancelled") continue;
    if (!entry.dueDate.startsWith(month)) continue;

    onceItems.push({
      id: `once_${entry.id}`,
      name: entry.name,
      amount: entry.amount,
      type: entry.type,
      responsible: entry.responsible,
      category: entry.category,
      kind: "once",
      label: "Lançamento avulso",
      notes: entry.description || entry.notes,
    });
  }

  const allItems = [...recurringItems, ...installmentItems, ...onceItems];

  // Cálculo por grupos
  function summarizeGroup(items: MonthlyReportItem[]): MonthlyReportGroup {
    const expense = round(
      items.filter((i) => i.type === "expense").reduce((sum, i) => sum + i.amount, 0),
    );
    const income = round(
      items.filter((i) => i.type === "income").reduce((sum, i) => sum + i.amount, 0),
    );
    return {
      items,
      totalExpense: expense,
      totalIncome: income,
      net: round(income - expense),
    };
  }

  const groupRecurring = summarizeGroup(recurringItems);
  const groupInstallments = summarizeGroup(installmentItems);
  const groupOnce = summarizeGroup(onceItems);

  const totalExpense = round(
    groupRecurring.totalExpense + groupInstallments.totalExpense + groupOnce.totalExpense,
  );
  const totalIncome = round(
    groupRecurring.totalIncome + groupInstallments.totalIncome + groupOnce.totalIncome,
  );
  const netAmount = round(totalIncome - totalExpense);

  // Totais por responsável
  function getResp(resp: Responsible): ResponsibleBreakdown {
    const respItems = allItems.filter((i) => i.responsible === resp);
    const exp = round(
      respItems.filter((i) => i.type === "expense").reduce((sum, i) => sum + i.amount, 0),
    );
    const inc = round(
      respItems.filter((i) => i.type === "income").reduce((sum, i) => sum + i.amount, 0),
    );
    return {
      expense: exp,
      income: inc,
      net: round(inc - exp),
      count: respItems.length,
    };
  }

  // Timeline comparativa de todos os meses disponíveis
  const timeline: MonthOverviewItem[] = AVAILABLE_MONTHS.map((m) => {
    const [year, mon] = m.split("-").map(Number);
    let mExp = 0;
    let mInc = 0;

    // Recorrentes
    for (const item of recurring) {
      if (item.status === "inactive") continue;
      const sPrefix = item.startedAt ? item.startedAt.slice(0, 7) : "";
      const ePrefix = item.endedAt ? item.endedAt.slice(0, 7) : null;
      if (sPrefix && m < sPrefix) continue;
      if (ePrefix && m > ePrefix) continue;
      if (item.status === "closed" && ePrefix && m > ePrefix) continue;

      if (isIncomeText(item.description) || isIncomeText(item.name)) {
        mInc += item.amount;
      } else {
        mExp += item.amount;
      }
    }

    // Parcelamentos
    for (const plan of plans) {
      const [sy, sm] = plan.firstDueDate.split("-").map(Number);
      const diff = (year - sy) * 12 + (mon - sm);
      if (diff >= 0 && diff < plan.installmentCount) {
        if (isIncomeText(plan.description) || isIncomeText(plan.name)) {
          mInc += plan.installmentAmount;
        } else {
          mExp += plan.installmentAmount;
        }
      }
    }

    // Avulsos
    for (const entry of entries) {
      if (entry.commitmentKind !== "once" || entry.status === "cancelled") continue;
      if (entry.dueDate.startsWith(m)) {
        if (entry.type === "income") mInc += entry.amount;
        else mExp += entry.amount;
      }
    }

    mExp = round(mExp);
    mInc = round(mInc);

    return {
      month: m,
      monthLabel: formatMonthYear(`${m}-01`),
      income: mInc,
      expense: mExp,
      net: round(mInc - mExp),
    };
  });

  return {
    month,
    monthLabel: formatMonthYear(`${month}-01`),
    totalIncome,
    totalExpense,
    netAmount,
    byResponsible: {
      adriano: getResp("adriano"),
      adrielle: getResp("adrielle"),
      both: getResp("both"),
    },
    groups: {
      recurring: groupRecurring,
      installments: groupInstallments,
      once: groupOnce,
    },
    allItems,
    timeline,
  };
}
