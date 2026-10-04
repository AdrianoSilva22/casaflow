"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CategoryPieChart,
  IncomeExpenseChart,
  MonthlyTrendChart,
  ResponsibleDonutChart,
  YearlyLineChart,
} from "@/features/dashboard/charts";
import { fetchDashboard } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { RESPONSIBLE_LABELS } from "@/domain/value-objects/enums";

export function ReportsView() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading || isError || !data) {
    return (
      <div className="space-y-4">
        <DashboardHeader title="Relatórios" />
        <QueryState
          isLoading={isLoading}
          isError={isError || !data}
          onRetry={() => void refetch()}
          loading={<Skeleton className="h-72" />}
        >
          {null}
        </QueryState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Relatórios" subtitle="As perguntas que o casal mais faz, respondidas" />
      <div className="grid gap-3 md:grid-cols-2">
        <Stat q="Quanto gastamos este mês?" a={formatCurrency(data.monthExpense)} />
        <Stat q="Quanto recebemos este mês?" a={formatCurrency(data.monthIncome)} />
        <Stat q="Quanto economizamos?" a={formatCurrency(data.monthSavings)} />
        <Stat q="Qual nossa média de gastos mensal?" a={formatCurrency(data.monthlyAverage)} />
        <Stat q="Quanto Adriano gastou?" a={formatCurrency(data.byResponsible.adriano)} />
        <Stat q="Quanto Adrielle gastou?" a={formatCurrency(data.byResponsible.adrielle)} />
        <Stat q="Quanto gastamos por ano?" a={formatCurrency(data.yearlyAverage * 12)} />
        <Stat q="Quais contas estão atrasadas?" a={`${data.overdueBills} contas`} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(data.byResponsible).map(([key, value]) => (
          <Card key={key}>
            <p className="text-sm text-muted-foreground">{RESPONSIBLE_LABELS[key as keyof typeof RESPONSIBLE_LABELS]}</p>
            <p className="mt-2 text-2xl font-semibold tabular">{formatCurrency(value)}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <IncomeExpenseChart data={data.monthlySeries} />
        <MonthlyTrendChart data={data.monthlySeries} />
        <CategoryPieChart data={data.categoryBreakdown} />
        <ResponsibleDonutChart data={data.byResponsible} />
        <div className="xl:col-span-2">
          <YearlyLineChart data={data.yearlySeries} />
        </div>
      </div>
    </div>
  );
}

function Stat({ q, a }: { q: string; a: string }) {
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{q}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular">{a}</p>
    </Card>
  );
}
