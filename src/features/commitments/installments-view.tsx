"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstallments, useMonthSummary } from "@/hooks/use-finances";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { PLAN_STATUS_LABELS } from "@/domain/value-objects/commitments";
import { RESPONSIBLE_LABELS, type Responsible } from "@/domain/value-objects/enums";
import { AVAILABLE_MONTHS } from "@/constants/months";
import { cn } from "@/lib/utils";
import type { InstallmentPlanSummary } from "@/domain/services/installments";

function isInstallmentIncome(plan: { description?: string | null; name?: string }) {
  const desc = (plan.description ?? "").toLowerCase();
  const name = (plan.name ?? "").toLowerCase();
  return (
    desc.includes("[receita]") ||
    desc.includes("[income]") ||
    desc.includes("receita") ||
    name.includes("receita")
  );
}

function getPlanOccurrenceInMonth(plan: InstallmentPlanSummary, targetMonth: string) {
  if (targetMonth === "all") {
    return {
      activeInMonth: plan.status === "active",
      installmentNumber: plan.currentNumber,
      remainingCount: plan.remainingCount,
      remainingAmount: plan.remainingAmount,
      isLast: plan.currentNumber === plan.installmentCount && plan.status === "active",
    };
  }

  const [startYear, startMonth] = plan.firstDueDate.split("-").map(Number);
  const [tYear, tMonth] = targetMonth.split("-").map(Number);
  const indexDiff = (tYear - startYear) * 12 + (tMonth - startMonth);

  const activeInMonth = indexDiff >= 0 && indexDiff < plan.installmentCount;
  const installmentNumber = indexDiff + 1;
  const remainingCount = Math.max(0, plan.installmentCount - installmentNumber);
  const remainingAmount = Math.round(remainingCount * plan.installmentAmount * 100) / 100;
  const isLast = installmentNumber === plan.installmentCount;

  return {
    activeInMonth,
    installmentNumber,
    remainingCount,
    remainingAmount,
    isLast,
  };
}

export function InstallmentsView() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const { data, isLoading } = useInstallments();
  const { data: monthSummary } = useMonthSummary(
    selectedMonth !== "all" ? selectedMonth : "2026-11",
  );
  const [filterResp, setFilterResp] = useState<Responsible | "all">("all");

  const evaluatedPlans = useMemo(() => {
    if (!data) return [];
    return data.map((plan) => ({
      ...plan,
      occurrence: getPlanOccurrenceInMonth(plan, selectedMonth),
    }));
  }, [data, selectedMonth]);

  const totals = useMemo(() => {
    if (!evaluatedPlans.length)
      return {
        all: 0,
        allIncomes: 0,
        netAmount: 0,
        hasInstallmentIncome: false,
        adriano: 0,
        adrielle: 0,
        both: 0,
        totalDebt: 0,
        countAll: 0,
        countIncome: 0,
        countAdriano: 0,
        countAdrielle: 0,
        countBoth: 0,
      };

    const activeInPeriod = evaluatedPlans.filter((p) => p.occurrence.activeInMonth);
    const incomePlans = activeInPeriod.filter(isInstallmentIncome);
    const expensePlans = activeInPeriod.filter((p) => !isInstallmentIncome(p));

    const allExpenses = expensePlans.reduce((sum, p) => sum + p.installmentAmount, 0);
    const installmentIncomeSum = incomePlans.reduce((sum, p) => sum + p.installmentAmount, 0);
    const hasInstallmentIncome = installmentIncomeSum > 0;
    const allIncomes = hasInstallmentIncome
      ? installmentIncomeSum
      : (monthSummary?.totalIncome ?? 0);
    const netAmount = allIncomes - allExpenses;

    const totalDebt = expensePlans.reduce((sum, p) => sum + p.occurrence.remainingAmount, 0);

    return {
      all: allExpenses,
      allIncomes,
      netAmount,
      hasInstallmentIncome,
      countAll: expensePlans.length,
      countIncome: incomePlans.length,
      adriano: expensePlans
        .filter((p) => p.responsible === "adriano")
        .reduce((sum, p) => sum + p.installmentAmount, 0),
      adrielle: expensePlans
        .filter((p) => p.responsible === "adrielle")
        .reduce((sum, p) => sum + p.installmentAmount, 0),
      both: expensePlans
        .filter((p) => p.responsible === "both")
        .reduce((sum, p) => sum + p.installmentAmount, 0),
      countAdriano: expensePlans.filter((p) => p.responsible === "adriano").length,
      countAdrielle: expensePlans.filter((p) => p.responsible === "adrielle").length,
      countBoth: expensePlans.filter((p) => p.responsible === "both").length,
      totalDebt,
    };
  }, [evaluatedPlans, monthSummary]);

  const filteredPlans = useMemo(() => {
    return evaluatedPlans.filter((p) => {
      const matchesPeriod = p.occurrence.activeInMonth;
      const matchesResp = filterResp === "all" || p.responsible === filterResp;
      return matchesPeriod && matchesResp;
    });
  }, [evaluatedPlans, filterResp]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DashboardHeader
          title="Parcelamentos"
          subtitle="O sistema controla cada parcela. Você só cadastra uma vez."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-48">
            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="all">Todos os meses</option>
              {AVAILABLE_MONTHS.map((item) => (
                <option key={item} value={item}>
                  {formatMonthYear(`${item}-01`)}
                </option>
              ))}
            </Select>
          </div>
          <Link
            href="/financas/nova"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Novo parcelamento
          </Link>
        </div>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          {/* Indicadores Principais Macro: Receitas, Despesas Parceladas e Saldo Líquido */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {totals.hasInstallmentIncome ? "Receitas Parceladas" : "Receita Total (Mês)"}
                </p>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {totals.hasInstallmentIncome ? `${totals.countIncome} planos` : "referência mês"}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
                {formatCurrency(totals.allIncomes)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {totals.hasInstallmentIncome
                  ? "parcelas a receber no mês"
                  : "receitas previstas no mês"}
              </p>
            </Card>

            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-primary">Despesas Parceladas / mês</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {totals.countAll} planos
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular">
                {formatCurrency(totals.all)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Saldo devedor total: {formatCurrency(totals.totalDebt)}
              </p>
            </Card>

            <Card
              className={cn(
                "p-4 transition-all",
                totals.netAmount >= 0
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/20 bg-rose-500/5",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Saldo Líquido</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    totals.netAmount >= 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                  )}
                >
                  {totals.netAmount >= 0 ? "Superávit" : "Déficit"}
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 text-2xl font-bold tracking-tight tabular",
                  totals.netAmount >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {formatCurrency(totals.netAmount)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                receitas menos parcelas no mês
              </p>
            </Card>
          </div>

          {/* Mini Indicadores por Responsável no Topo */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setFilterResp("all")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  filterResp === "all" ? "ring-2 ring-primary" : "hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Total Despesas / mês</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {totals.countAll} planos
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-foreground tabular">
                  {formatCurrency(totals.all)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">todas as pessoas</p>
              </Card>
            </button>

            <button
              type="button"
              onClick={() => setFilterResp(filterResp === "adriano" ? "all" : "adriano")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  filterResp === "adriano" ? "ring-2 ring-blue-500" : "hover:border-blue-400/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Adriano</p>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {totals.countAdriano} planos
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular">
                  {formatCurrency(totals.adriano)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">por mês</p>
              </Card>
            </button>

            <button
              type="button"
              onClick={() => setFilterResp(filterResp === "adrielle" ? "all" : "adrielle")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  filterResp === "adrielle" ? "ring-2 ring-pink-500" : "hover:border-pink-400/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Adrielle</p>
                  <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                    {totals.countAdrielle} planos
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-pink-600 dark:text-pink-400 tabular">
                  {formatCurrency(totals.adrielle)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">por mês</p>
              </Card>
            </button>

            <button
              type="button"
              onClick={() => setFilterResp(filterResp === "both" ? "all" : "both")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  filterResp === "both" ? "ring-2 ring-amber-500" : "hover:border-amber-400/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Ambos</p>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {totals.countBoth} planos
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular">
                  {formatCurrency(totals.both)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">por mês</p>
              </Card>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong>{filteredPlans.length}</strong> de {data.length} parcelamentos
              {filterResp !== "all" ? ` (Filtrado por ${RESPONSIBLE_LABELS[filterResp]})` : ""}
            </p>
            {filterResp !== "all" ? (
              <button
                type="button"
                onClick={() => setFilterResp("all")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Limpar filtro
              </button>
            ) : null}
          </div>

          {/* Lista de Parcelamentos */}
          <div className="space-y-3">
            {filteredPlans.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Nenhum parcelamento encontrado para este responsável.
              </Card>
            ) : (
              filteredPlans.map((plan) => (
                <Card key={plan.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{plan.name}</p>
                        {isInstallmentIncome(plan) ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Receita
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.installmentCount} parcelas · {RESPONSIBLE_LABELS[plan.responsible]}
                        {plan.description
                          ? ` · ${plan.description
                              .replace(/\[receita\]/gi, "")
                              .replace(/\[income\]/gi, "")
                              .trim()}`
                          : ""}
                      </p>
                    </div>
                    <Badge tone={plan.status === "closed" ? "success" : "primary"}>
                      {plan.status === "closed"
                        ? "Parcelamento Encerrado"
                        : PLAN_STATUS_LABELS[plan.status]}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <Metric label="Valor total" value={formatCurrency(plan.totalAmount)} />
                    <Metric
                      label={selectedMonth !== "all" ? "Parcela no mês" : "Parcela atual"}
                      value={`${plan.occurrence.installmentNumber}/${plan.installmentCount}`}
                    />
                    <Metric label="Faltam" value={`${plan.occurrence.remainingCount} parcelas`} />
                    <Metric label="Valor parcela" value={formatCurrency(plan.installmentAmount)} />
                  </div>
                  {plan.occurrence.isLast ? (
                    <p className="mt-3 text-sm font-medium text-primary">Última parcela 🎉</p>
                  ) : null}
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular">{value}</p>
    </div>
  );
}
