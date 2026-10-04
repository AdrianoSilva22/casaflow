"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { useFinances } from "@/hooks/use-finances";
import { useUiStore } from "@/stores/ui.store";
import { FinancialCard } from "@/features/finances/financial-card";
import { FinancialFilters, type FilterState } from "@/features/finances/financial-filters";
import { FinancialTable } from "@/features/finances/financial-table";
import { QueryState } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";

const initialFilters: FilterState = {
  search: "",
  category: "all",
  status: "all",
  responsible: "all",
  type: "all",
  commitmentKind: "all",
  sort: "dueDate",
  direction: "desc",
};

export function FinancesView() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [page, setPage] = useState(1);
  const view = useUiStore((state) => state.financeView);
  const setView = useUiStore((state) => state.setFinanceView);
  const { data, isLoading, isError, refetch } = useFinances({
    filters,
    sort: filters.sort,
    direction: filters.direction,
    page,
    pageSize: 10,
  });

  return (
    <div className="space-y-5">
      <DashboardHeader title="Finanças" subtitle="Todos os lançamentos do casal" />
      <FinancialFilters
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} lançamentos</p>
        <div className="hidden gap-2 md:flex">
          <Button variant={view === "cards" ? "soft" : "outline"} size="sm" onClick={() => setView("cards")}>
            <LayoutGrid className="size-4" />
            Cards
          </Button>
          <Button variant={view === "table" ? "soft" : "outline"} size="sm" onClick={() => setView("table")}>
            <Table2 className="size-4" />
            Tabela
          </Button>
        </div>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError || (!isLoading && !data)}
        onRetry={() => void refetch()}
        loading={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        }
      >
        {data ? (
        <>
          {data.items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border bg-card p-6 text-sm text-muted-foreground">
              Nenhum lançamento ainda. Toque em + para cadastrar a primeira conta.
            </div>
          ) : null}
          <div className={view === "table" ? "hidden md:block" : "space-y-3 md:space-y-3"}>
            {view === "table" ? <FinancialTable items={data.items} /> : null}
            <div className={view === "table" ? "space-y-3 md:hidden" : "space-y-3"}>
              {view === "cards" ? data.items.map((entry) => <FinancialCard key={entry.id} entry={entry} />) : null}
              {view === "table"
                ? data.items.map((entry) => (
                    <div key={entry.id} className="md:hidden">
                      <FinancialCard entry={entry} />
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Anterior
            </Button>
            <p className="text-sm text-muted-foreground">
              Página {data.page} de {data.pageCount}
            </p>
            <Button variant="outline" disabled={page >= data.pageCount} onClick={() => setPage((current) => current + 1)}>
              Próxima
            </Button>
          </div>
        </>
        ) : null}
      </QueryState>
    </div>
  );
}
