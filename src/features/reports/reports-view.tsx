"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar, Layers, Repeat, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useMonthlyReport } from "@/hooks/use-finances";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import {
  CATEGORY_LABELS,
  RESPONSIBLE_LABELS,
  type Responsible,
} from "@/domain/value-objects/enums";
import { AVAILABLE_MONTHS } from "@/constants/months";
import { cn } from "@/lib/utils";

export function ReportsView() {
  const currentMonthKey = format(new Date(), "yyyy-MM");
  const defaultMonth = (AVAILABLE_MONTHS as readonly string[]).includes(currentMonthKey)
    ? currentMonthKey
    : "2026-11";

  const [month, setMonth] = useState<string>(defaultMonth);
  const [activeTab, setActiveTab] = useState<"competence" | "timeline">("competence");
  const [filterResp, setFilterResp] = useState<Responsible | "all">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useMonthlyReport(month);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();

    return data.allItems.filter((item) => {
      const matchResp = filterResp === "all" || item.responsible === filterResp;
      const matchSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        (item.notes && item.notes.toLowerCase().includes(term));
      return matchResp && matchSearch;
    });
  }, [data, filterResp, search]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Seletor de Mês */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardHeader
            title="Relatório de Competência"
            subtitle="Previsão pura do mês: receitas, despesas e líquido independente de data de pagamento."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-52">
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
              {AVAILABLE_MONTHS.map((item) => (
                <option key={item} value={item}>
                  {formatMonthYear(`${item}-01`)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("competence")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "competence"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Wallet className="h-4 w-4" />
          Previsão do Mês ({formatMonthYear(`${month}-01`)})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "timeline"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Calendar className="h-4 w-4" />
          Comparativo Anual (2026 & 2027)
        </button>
      </div>

      {isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-64" />
        </div>
      ) : activeTab === "competence" ? (
        <div className="space-y-6">
          {/* 1. Indicadores Principais Macro do Mês */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Receita Total */}
            <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Receita Total do Mês
                </span>
                <span className="rounded-full bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 tabular">
                {formatCurrency(data.totalIncome)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                entradas previstas pertencentes a {data.monthLabel}
              </p>
            </Card>

            {/* Despesa Total */}
            <Card className="relative overflow-hidden border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Despesas Totais do Mês
                </span>
                <span className="rounded-full bg-primary/15 p-2 text-primary">
                  <ArrowDownRight className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground tabular">
                {formatCurrency(data.totalExpense)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                recorrentes + parcelas + avulsos do mês
              </p>
            </Card>

            {/* Saldo Líquido */}
            <Card
              className={cn(
                "relative overflow-hidden p-5 transition-all",
                data.netAmount >= 0
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/20 bg-rose-500/5",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Saldo Líquido
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold",
                    data.netAmount >= 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                  )}
                >
                  {data.netAmount >= 0 ? "Superávit (+)" : "Déficit (-)"}
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 text-3xl font-extrabold tracking-tight tabular",
                  data.netAmount >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {formatCurrency(data.netAmount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                receita total menos despesas totais
              </p>
            </Card>
          </div>

          {/* 2. Indicadores por Responsável no Mês */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visão por Responsável no Mês
              </h3>
              {filterResp !== "all" ? (
                <button
                  type="button"
                  onClick={() => setFilterResp("all")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Remover filtro ({RESPONSIBLE_LABELS[filterResp]})
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Adriano */}
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
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Adriano
                    </p>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {data.byResponsible.adriano.count} contas
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Despesas:</span>
                      <strong className="text-foreground tabular">
                        {formatCurrency(data.byResponsible.adriano.expense)}
                      </strong>
                    </div>
                    {data.byResponsible.adriano.income > 0 ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Receitas:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 tabular">
                          {formatCurrency(data.byResponsible.adriano.income)}
                        </strong>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-border/30 pt-1 text-xs">
                      <span className="text-muted-foreground">Líquido:</span>
                      <strong
                        className={cn(
                          "tabular font-bold",
                          data.byResponsible.adriano.net >= 0
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {formatCurrency(data.byResponsible.adriano.net)}
                      </strong>
                    </div>
                  </div>
                </Card>
              </button>

              {/* Adrielle */}
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
                    <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                      Adrielle
                    </p>
                    <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                      {data.byResponsible.adrielle.count} contas
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Despesas:</span>
                      <strong className="text-foreground tabular">
                        {formatCurrency(data.byResponsible.adrielle.expense)}
                      </strong>
                    </div>
                    {data.byResponsible.adrielle.income > 0 ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Receitas:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 tabular">
                          {formatCurrency(data.byResponsible.adrielle.income)}
                        </strong>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-border/30 pt-1 text-xs">
                      <span className="text-muted-foreground">Líquido:</span>
                      <strong
                        className={cn(
                          "tabular font-bold",
                          data.byResponsible.adrielle.net >= 0
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {formatCurrency(data.byResponsible.adrielle.net)}
                      </strong>
                    </div>
                  </div>
                </Card>
              </button>

              {/* Ambos (Casa) */}
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
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Ambos (Casa)
                    </p>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      {data.byResponsible.both.count} contas
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Despesas:</span>
                      <strong className="text-foreground tabular">
                        {formatCurrency(data.byResponsible.both.expense)}
                      </strong>
                    </div>
                    {data.byResponsible.both.income > 0 ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Receitas:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 tabular">
                          {formatCurrency(data.byResponsible.both.income)}
                        </strong>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-border/30 pt-1 text-xs">
                      <span className="text-muted-foreground">Líquido:</span>
                      <strong
                        className={cn(
                          "tabular font-bold",
                          data.byResponsible.both.net >= 0 ? "text-emerald-600" : "text-rose-600",
                        )}
                      >
                        {formatCurrency(data.byResponsible.both.net)}
                      </strong>
                    </div>
                  </div>
                </Card>
              </button>
            </div>
          </div>

          {/* 3. Origem das Despesas e Receitas no Mês */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Composição do Mês por Origem
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Recorrentes Fixos</p>
                </div>
                <p className="mt-2 text-lg font-bold text-foreground tabular">
                  {formatCurrency(data.groups.recurring.totalExpense)}
                </p>
                {data.groups.recurring.totalIncome > 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    + {formatCurrency(data.groups.recurring.totalIncome)} (receitas)
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.groups.recurring.items.length} contas fixas
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Parcelamentos</p>
                </div>
                <p className="mt-2 text-lg font-bold text-foreground tabular">
                  {formatCurrency(data.groups.installments.totalExpense)}
                </p>
                {data.groups.installments.totalIncome > 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    + {formatCurrency(data.groups.installments.totalIncome)} (receitas)
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.groups.installments.items.length} parcelas no mês
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Lançamentos Avulsos</p>
                </div>
                <p className="mt-2 text-lg font-bold text-foreground tabular">
                  {formatCurrency(data.groups.once.totalExpense)}
                </p>
                {data.groups.once.totalIncome > 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    + {formatCurrency(data.groups.once.totalIncome)} (receitas)
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.groups.once.items.length} compras/gastos pontuais
                </p>
              </Card>
            </div>
          </div>

          {/* 4. Lista Completa de Itens do Mês */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold">Todas as Contas de {data.monthLabel}</h3>
                <p className="text-xs text-muted-foreground">
                  Mostrando {filteredItems.length} de {data.allItems.length} itens do mês
                  {filterResp !== "all" ? ` (Filtrado por ${RESPONSIBLE_LABELS[filterResp]})` : ""}
                </p>
              </div>

              <div className="w-full sm:w-64">
                <Input
                  placeholder="Buscar conta..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  Nenhum lançamento encontrado para os filtros selecionados em {data.monthLabel}.
                </Card>
              ) : (
                filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="flex items-center justify-between p-3.5 transition-colors hover:border-primary/40"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        {item.type === "income" ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Receita
                          </span>
                        ) : null}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {RESPONSIBLE_LABELS[item.responsible]} ·{" "}
                        {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ||
                          item.category}
                        {item.notes ? ` · ${item.notes}` : ""}
                      </p>
                    </div>

                    <p
                      className={cn(
                        "text-base font-bold tabular",
                        item.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      {item.type === "income" ? "+ " : "- "}
                      {formatCurrency(item.amount)}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Aba Comparativo Anual 2026 e 2027 */
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold">Panorama Mensal Completo (2026 & 2027)</h3>
            <p className="text-xs text-muted-foreground">
              Acompanhe a projeção mês a mês de receitas, despesas e saldo líquido. Clique em
              qualquer mês para abrir a competência dele.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.timeline.map((item) => {
              const isSelected = item.month === month;
              return (
                <button
                  key={item.month}
                  type="button"
                  onClick={() => {
                    setMonth(item.month);
                    setActiveTab("competence");
                  }}
                  className="text-left transition-transform active:scale-[0.98]"
                >
                  <Card
                    className={cn(
                      "p-4 transition-all hover:border-primary/60",
                      isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">{item.monthLabel}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          item.net >= 0
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {item.net >= 0 ? "Superávit" : "Déficit"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Receitas:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular">
                          {formatCurrency(item.income)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Despesas:</span>
                        <span className="font-semibold text-foreground tabular">
                          {formatCurrency(item.expense)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border/30 pt-1.5 font-bold">
                        <span>Líquido:</span>
                        <span
                          className={cn(
                            "tabular",
                            item.net >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400",
                          )}
                        >
                          {formatCurrency(item.net)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
