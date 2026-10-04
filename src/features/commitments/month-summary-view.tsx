"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialCard } from "@/features/finances/financial-card";
import { useMonthSummary } from "@/hooks/use-finances";
import { format } from "date-fns";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

import { RESPONSIBLE_LABELS, type Responsible } from "@/domain/value-objects/enums";
import { AVAILABLE_MONTHS } from "@/constants/months";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "unpaid", label: "Não pago" },
  { id: "paid", label: "Pago" },
  { id: "overdue", label: "Atrasado" },
] as const;

type StatusFilter = (typeof FILTERS)[number]["id"];

export function MonthSummaryView() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState<Responsible | "all">("all");
  const { data, isLoading } = useMonthSummary(month);

  const responsibleTotals = useMemo(() => {
    if (!data)
      return {
        all: 0,
        adriano: 0,
        adrielle: 0,
        both: 0,
        countAdriano: 0,
        countAdrielle: 0,
        countBoth: 0,
      };
    const expenses = data.items.filter((item) => item.status !== "cancelled");
    return {
      all: data.predictedTotal,
      adriano: expenses
        .filter((i) => i.responsible === "adriano")
        .reduce((sum, i) => sum + i.amount, 0),
      adrielle: expenses
        .filter((i) => i.responsible === "adrielle")
        .reduce((sum, i) => sum + i.amount, 0),
      both: expenses.filter((i) => i.responsible === "both").reduce((sum, i) => sum + i.amount, 0),
      countAdriano: expenses.filter((i) => i.responsible === "adriano").length,
      countAdrielle: expenses.filter((i) => i.responsible === "adrielle").length,
      countBoth: expenses.filter((i) => i.responsible === "both").length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();

    return data.items.filter((entry) => {
      const matchesStatus =
        status === "all" ||
        (status === "paid" && entry.status === "paid") ||
        (status === "unpaid" && entry.status !== "paid" && entry.status !== "cancelled") ||
        (status === "overdue" && entry.status === "overdue");

      const matchesResponsible =
        responsibleFilter === "all" || entry.responsible === responsibleFilter;

      const matchesSearch =
        !term ||
        [entry.name, entry.description, entry.notes].some((value) =>
          value.toLowerCase().includes(term),
        );

      return matchesStatus && matchesResponsible && matchesSearch;
    });
  }, [data, search, status, responsibleFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DashboardHeader
          title="Resumo do mês"
          subtitle="Visão geral de compromissos, receitas e despesas por pessoa."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-48">
            <Select value={month} onChange={(event) => setMonth(event.target.value)}>
              {AVAILABLE_MONTHS.map((item) => (
                <option key={item} value={item}>
                  {formatMonthYear(`${item}-01`)}
                </option>
              ))}
            </Select>
          </div>
          <Link
            href="/relatorios"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/60 bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Relatório Competência
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
                  Receita Total
                </p>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {data.incomeCount ?? 0} receitas
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
                {formatCurrency(data.totalIncome ?? 0)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">entradas previstas no mês</p>
            </Card>

            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-primary">Despesas Totais</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {data.items.length} contas
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular">
                {formatCurrency(data.predictedTotal)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">saídas previstas no mês</p>
            </Card>

            <Card
              className={cn(
                "p-4 transition-all",
                (data.totalIncome ?? 0) - data.predictedTotal >= 0
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/20 bg-rose-500/5",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Saldo Líquido</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    (data.totalIncome ?? 0) - data.predictedTotal >= 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                  )}
                >
                  {(data.totalIncome ?? 0) - data.predictedTotal >= 0 ? "Superávit" : "Déficit"}
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 text-2xl font-bold tracking-tight tabular",
                  (data.totalIncome ?? 0) - data.predictedTotal >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {formatCurrency((data.totalIncome ?? 0) - data.predictedTotal)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">receitas menos despesas</p>
            </Card>
          </div>

          {/* Mini Indicadores por Responsável no Topo (Filtros interativos) */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setResponsibleFilter("all")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  responsibleFilter === "all" ? "ring-2 ring-primary" : "hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Total Despesas</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {data.items.length} contas
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-foreground tabular">
                  {formatCurrency(responsibleTotals.all)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">todas as pessoas</p>
              </Card>
            </button>

            <button
              type="button"
              onClick={() =>
                setResponsibleFilter(responsibleFilter === "adriano" ? "all" : "adriano")
              }
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  responsibleFilter === "adriano"
                    ? "ring-2 ring-blue-500"
                    : "hover:border-blue-400/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Adriano</p>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {responsibleTotals.countAdriano} contas
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular">
                  {formatCurrency(responsibleTotals.adriano)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">despesas no mês</p>
              </Card>
            </button>

            <button
              type="button"
              onClick={() =>
                setResponsibleFilter(responsibleFilter === "adrielle" ? "all" : "adrielle")
              }
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  responsibleFilter === "adrielle"
                    ? "ring-2 ring-pink-500"
                    : "hover:border-pink-400/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Adrielle</p>
                  <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                    {responsibleTotals.countAdrielle} contas
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-pink-600 dark:text-pink-400 tabular">
                  {formatCurrency(responsibleTotals.adrielle)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">despesas no mês</p>
              </Card>
            </button>

            <button
              type="button"
              onClick={() => setResponsibleFilter(responsibleFilter === "both" ? "all" : "both")}
              className="text-left transition-transform active:scale-[0.98]"
            >
              <Card
                className={cn(
                  "p-4 transition-all",
                  responsibleFilter === "both"
                    ? "ring-2 ring-amber-500"
                    : "hover:border-amber-400/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Ambos (Casa)</p>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {responsibleTotals.countBoth} contas
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular">
                  {formatCurrency(responsibleTotals.both)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">despesas conjuntas</p>
              </Card>
            </button>
          </div>

          {/* Cards de Status e Receitas */}
          <div className="grid gap-3 md:grid-cols-4">
            <Stat
              label="Receitas total"
              value={`${data.incomeCount ?? 0} receitas`}
              amount={data.totalIncome ?? 0}
              tone="success"
              active={false}
            />
            <Stat
              label="Despesas total"
              value={`${data.items.length} contas`}
              amount={data.predictedTotal}
              tone="primary"
              active={status === "all"}
              onClick={() => setStatus("all")}
            />
            <Stat
              label="Não pago"
              value={`${data.pendingCount + data.overdueCount} pendentes`}
              amount={data.pendingAmount + data.overdueAmount}
              tone="warning"
              active={status === "unpaid"}
              onClick={() => setStatus("unpaid")}
            />
            <Stat
              label="Atrasado"
              value={`${data.overdueCount} atrasadas`}
              amount={data.overdueAmount}
              tone="danger"
              active={status === "overdue"}
              onClick={() => setStatus("overdue")}
            />
          </div>

          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Lançamentos do mês</h2>
                {responsibleFilter !== "all" ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Filtrado por: {RESPONSIBLE_LABELS[responsibleFilter]}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">{filtered.length} encontrados</p>
                {responsibleFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setResponsibleFilter("all")}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ver todos
                  </button>
                ) : null}
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, descrição..."
                className="pl-11"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={status === item.id ? "soft" : "outline"}
                  onClick={() => setStatus(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <Card className="text-sm text-muted-foreground">
                Nenhum lançamento com esse filtro.
              </Card>
            ) : (
              filtered.map((entry) => <FinancialCard key={entry.id} entry={entry} />)
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  amount,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: string;
  amount: number;
  tone: "success" | "warning" | "danger" | "primary";
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className={cn(active && "ring-2 ring-primary/40")}>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-xs">{value}</p>
        <p
          className={`mt-1 text-xl font-semibold tabular ${
            tone === "success"
              ? "text-success"
              : tone === "warning"
                ? "text-warning"
                : tone === "danger"
                  ? "text-danger"
                  : ""
          }`}
        >
          {formatCurrency(amount)}
        </p>
      </Card>
    </button>
  );
}
