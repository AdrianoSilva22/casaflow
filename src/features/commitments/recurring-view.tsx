"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurring, useRecurringMutation } from "@/hooks/use-finances";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { RECURRING_STATUS_LABELS, type RecurringStatus } from "@/domain/value-objects/commitments";
import {
  CATEGORY_LABELS,
  RESPONSIBLE_LABELS,
  type Responsible,
} from "@/domain/value-objects/enums";
import { AVAILABLE_MONTHS } from "@/constants/months";
import { cn } from "@/lib/utils";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";

function isRecurringIncome(item: { description?: string | null; name?: string }) {
  const desc = (item.description ?? "").toLowerCase();
  const name = (item.name ?? "").toLowerCase();
  return (
    desc.includes("[receita]") ||
    desc.includes("[income]") ||
    desc.includes("receita") ||
    name.includes("receita")
  );
}

function isRecurringActiveInMonth(item: RecurringExpense, targetMonth: string) {
  if (targetMonth === "all") {
    return item.status === "active";
  }

  const startPrefix = item.startedAt ? item.startedAt.slice(0, 7) : "";
  const endPrefix = item.endedAt ? item.endedAt.slice(0, 7) : null;

  if (startPrefix && targetMonth < startPrefix) {
    return false;
  }
  if (endPrefix && targetMonth > endPrefix) {
    return false;
  }
  if (item.status === "closed" && endPrefix && targetMonth > endPrefix) {
    return false;
  }
  if (item.status === "inactive") {
    return false;
  }

  return true;
}

export function RecurringView() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const { data, isLoading } = useRecurring();
  const update = useRecurringMutation();
  const [filterResp, setFilterResp] = useState<Responsible | "all">("all");

  const totals = useMemo(() => {
    if (!data)
      return {
        allExpenses: 0,
        allIncomes: 0,
        netAmount: 0,
        countAll: 0,
        countIncome: 0,
        countExpense: 0,
        adriano: 0,
        adrielle: 0,
        both: 0,
        countAdriano: 0,
        countAdrielle: 0,
        countBoth: 0,
      };
    const active = data.filter((item) => isRecurringActiveInMonth(item, selectedMonth));
    const incomeItems = active.filter(isRecurringIncome);
    const expenseItems = active.filter((item) => !isRecurringIncome(item));

    const allExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const allIncomes = incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const netAmount = allIncomes - allExpenses;

    return {
      allExpenses,
      allIncomes,
      netAmount,
      countAll: active.length,
      countIncome: incomeItems.length,
      countExpense: expenseItems.length,
      adriano: expenseItems
        .filter((item) => item.responsible === "adriano")
        .reduce((sum, item) => sum + item.amount, 0),
      adrielle: expenseItems
        .filter((item) => item.responsible === "adrielle")
        .reduce((sum, item) => sum + item.amount, 0),
      both: expenseItems
        .filter((item) => item.responsible === "both")
        .reduce((sum, item) => sum + item.amount, 0),
      countAdriano: expenseItems.filter((item) => item.responsible === "adriano").length,
      countAdrielle: expenseItems.filter((item) => item.responsible === "adrielle").length,
      countBoth: expenseItems.filter((item) => item.responsible === "both").length,
    };
  }, [data, selectedMonth]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const matchesPeriod = isRecurringActiveInMonth(item, selectedMonth);
      const matchesResp = filterResp === "all" || item.responsible === filterResp;
      return matchesPeriod && matchesResp;
    });
  }, [data, selectedMonth, filterResp]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DashboardHeader
          title="Contas recorrentes"
          subtitle="Cadastra uma vez. O mês seguinte nasce sozinho."
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
            Nova recorrente
          </Link>
        </div>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          {/* Indicadores Principais Macro: Receitas, Despesas e Saldo Líquido */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Receita Recorrente
                </p>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {totals.countIncome} ativas
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
                {formatCurrency(totals.allIncomes)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">entradas fixas mensais</p>
            </Card>

            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-primary">Despesas Recorrentes</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {totals.countExpense} ativas
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular">
                {formatCurrency(totals.allExpenses)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">saídas fixas mensais</p>
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
                <p className="text-xs font-medium text-muted-foreground">
                  Saldo Líquido Recorrente
                </p>
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
                receitas menos despesas fixas
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
                    {totals.countExpense} ativas
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-foreground tabular">
                  {formatCurrency(totals.allExpenses)}
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
                    {totals.countAdriano} contas
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
                    {totals.countAdrielle} contas
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
                    {totals.countBoth} contas
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular">
                  {formatCurrency(totals.both)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">despesas conjuntas</p>
              </Card>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong>{filteredItems.length}</strong> de {data.length} recorrentes
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

          {/* Lista de Recorrentes */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma conta recorrente encontrada para este responsável.
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.name}</p>
                        {isRecurringIncome(item) ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Receita
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.amount)} · Todo dia {item.dueDay}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[item.category]} · {RESPONSIBLE_LABELS[item.responsible]}
                        {item.description
                          ? ` · ${item.description
                              .replace(/\[receita\]/gi, "")
                              .replace(/\[income\]/gi, "")
                              .trim()}`
                          : ""}
                      </p>
                    </div>
                    <Badge
                      tone={
                        item.status === "active"
                          ? "success"
                          : item.status === "inactive"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {RECURRING_STATUS_LABELS[item.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["active", "inactive", "closed"] as RecurringStatus[]).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={item.status === status ? "soft" : "outline"}
                        loading={update.isPending}
                        onClick={() => update.mutate({ id: item.id, status })}
                      >
                        {RECURRING_STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
