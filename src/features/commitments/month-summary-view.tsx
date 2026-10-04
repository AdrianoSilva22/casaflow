"use client";

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

const MONTHS = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
];

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "paid", label: "Pago" },
  { id: "unpaid", label: "Não pago" },
  { id: "overdue", label: "Atrasado" },
] as const;

type StatusFilter = (typeof FILTERS)[number]["id"];

export function MonthSummaryView() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [status, setStatus] = useState<StatusFilter>("unpaid");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMonthSummary(month);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();

    return data.items.filter((entry) => {
      const matchesStatus =
        status === "all" ||
        (status === "paid" && entry.status === "paid") ||
        (status === "unpaid" && entry.status !== "paid" && entry.status !== "cancelled") ||
        (status === "overdue" && entry.status === "overdue");

      const matchesSearch =
        !term ||
        [entry.name, entry.description, entry.notes].some((value) => value.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [data, search, status]);

  return (
    <div className="space-y-5">
      <DashboardHeader title="Resumo do mês" subtitle="O que já foi pago, o que falta e o que ainda vem." />
      <Select value={month} onChange={(event) => setMonth(event.target.value)}>
        {MONTHS.map((item) => (
          <option key={item} value={item}>
            {formatMonthYear(`${item}-01`)}
          </option>
        ))}
      </Select>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Stat
              label="Já pago"
              value={`${data.paidCount} contas`}
              amount={data.paidAmount}
              tone="success"
              active={status === "paid"}
              onClick={() => setStatus("paid")}
            />
            <Stat
              label="Não pago"
              value={`${data.pendingCount + data.overdueCount} contas`}
              amount={data.pendingAmount + data.overdueAmount}
              tone="warning"
              active={status === "unpaid"}
              onClick={() => setStatus("unpaid")}
            />
            <Stat
              label="Atrasado"
              value={`${data.overdueCount} contas`}
              amount={data.overdueAmount}
              tone="danger"
              active={status === "overdue"}
              onClick={() => setStatus("overdue")}
            />
            <Stat
              label="Total previsto"
              value="do mês"
              amount={data.predictedTotal}
              tone="primary"
              active={status === "all"}
              onClick={() => setStatus("all")}
            />
          </div>

          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold">Lançamentos do mês</h2>
              <p className="text-xs text-muted-foreground">{filtered.length} encontrados</p>
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
              <Card className="text-sm text-muted-foreground">Nenhum lançamento com esse filtro.</Card>
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
