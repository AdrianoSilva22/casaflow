"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  Layers,
  PiggyBank,
  Receipt,
  Repeat,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { AlertsStrip } from "@/features/commitments/alerts-strip";
import { COMMITMENT_ITEMS } from "@/constants/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSummaryCard } from "@/features/dashboard/summary-card";
import {
  CategoryPieChart,
  IncomeExpenseChart,
  MonthlyTrendChart,
  ResponsibleDonutChart,
  YearlyLineChart,
} from "@/features/dashboard/charts";
import { QueryState } from "@/components/ui/query-state";
import { fetchDashboard } from "@/lib/api";
import { formatCurrency, formatMonthYear } from "@/lib/format";

export function DashboardView() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  const monthLabel = formatMonthYear(new Date());

  if (isLoading || isError || !data) {
    return (
      <div className="space-y-4">
        <DashboardHeader title="Olá, casal" subtitle={isLoading ? "Carregando o mês..." : `Visão de ${monthLabel}`} />
        <QueryState
          isLoading={isLoading}
          isError={isError || !data}
          onRetry={() => void refetch()}
          loading={
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
          }
        >
          {null}
        </QueryState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Olá, Adriano & Adrielle" subtitle={`Visão de ${monthLabel}`} />

      <div className="no-scrollbar flex gap-2 overflow-x-auto lg:hidden">
        {COMMITMENT_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-muted px-3 py-2 text-xs font-semibold">
            {item.label}
          </Link>
        ))}
      </div>

      <AlertsStrip alerts={data.commitments.alerts} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <DashboardSummaryCard label="Saldo atual" value={formatCurrency(data.currentBalance)} icon={Wallet} tone="primary" hint="Pago até hoje" />
        <DashboardSummaryCard label="Receitas do mês" value={formatCurrency(data.monthIncome)} icon={ArrowUpRight} tone="secondary" />
        <DashboardSummaryCard label="Despesas do mês" value={formatCurrency(data.monthExpense)} icon={ArrowDownRight} tone="danger" />
        <DashboardSummaryCard label="Contas em aberto" value={String(data.openBills)} icon={Receipt} tone="warning" />
        <DashboardSummaryCard label="Contas atrasadas" value={String(data.overdueBills)} icon={AlertTriangle} tone="danger" />
        <DashboardSummaryCard label="Contas a vencer" value={String(data.upcomingBills)} icon={CalendarClock} tone="warning" hint="Nesta semana" />
        <DashboardSummaryCard label="Total pago" value={formatCurrency(data.totalPaid)} icon={CircleDollarSign} tone="success" />
        <DashboardSummaryCard label="Economia do mês" value={formatCurrency(data.monthSavings)} icon={PiggyBank} tone="success" />
        <DashboardSummaryCard label="Contas pagas no mês" value={String(data.commitments.paidCount)} icon={CircleDollarSign} tone="success" hint={formatCurrency(data.commitments.paidAmount)} />
        <DashboardSummaryCard label="Contas pendentes" value={String(data.commitments.pendingCount)} icon={Receipt} tone="warning" hint={formatCurrency(data.commitments.pendingAmount)} />
        <DashboardSummaryCard label="Parcelas ativas" value={String(data.commitments.activePlans)} icon={Layers} tone="primary" />
        <DashboardSummaryCard label="Parcelas restantes" value={String(data.commitments.remainingInstallments)} icon={Layers} tone="warning" />
        <DashboardSummaryCard label="Comprometimento futuro" value={formatCurrency(data.commitments.futureCommitted)} icon={CalendarClock} tone="danger" />
        <DashboardSummaryCard label="Contas recorrentes" value={String(data.commitments.recurringCount)} icon={Repeat} tone="secondary" />
        <DashboardSummaryCard label="Gastos recorrentes" value={formatCurrency(data.commitments.recurringMonthly)} icon={Repeat} tone="secondary" hint="todo mês" />
        <DashboardSummaryCard
          label="Próxima parcela"
          value={data.commitments.nextInstallment ? formatCurrency(data.commitments.nextInstallment.amount) : "—"}
          icon={Layers}
          tone="primary"
          hint={data.commitments.nextInstallment ? `${data.commitments.nextInstallment.name} · ${data.commitments.nextInstallment.label}` : undefined}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">Parcelamento mais caro</p>
          <p className="mt-2 font-semibold">{data.commitments.mostExpensiveInstallment?.name ?? "—"}</p>
          <p className="mt-1 text-xl font-semibold tabular">
            {data.commitments.mostExpensiveInstallment
              ? `${formatCurrency(data.commitments.mostExpensiveInstallment.amount)}/mês`
              : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Visão futura comprometida</p>
          <div className="mt-3 space-y-2 text-sm">
            <p>3 meses: <strong className="tabular">{formatCurrency(data.commitments.projection3.reduce((sum, item) => sum + item.total, 0))}</strong></p>
            <p>6 meses: <strong className="tabular">{formatCurrency(data.commitments.projection6.reduce((sum, item) => sum + item.total, 0))}</strong></p>
            <p>12 meses: <strong className="tabular">{formatCurrency(data.commitments.projection12.reduce((sum, item) => sum + item.total, 0))}</strong></p>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Insight label="Maior gasto mensal" month={data.maxMonthExpense} field="expense" />
        <Insight label="Menor gasto mensal" month={data.minMonthExpense} field="expense" />
        <Insight label="Mês mais econômico" month={data.mostEconomicalMonth} field="savings" />
        <Insight label="Mês mais caro" month={data.mostExpensiveMonth} field="savings" invert />
        <InsightMetric label="Média mensal" value={formatCurrency(data.monthlyAverage)} />
        <InsightMetric label="Média anual" value={formatCurrency(data.yearlyAverage)} />
        <InsightMetric label="Economia acumulada" value={formatCurrency(data.accumulatedSavings)} />
        <InsightMetric label="Total movimentado" value={formatCurrency(data.totalMoved)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <IncomeExpenseChart data={data.monthlySeries} />
        <MonthlyTrendChart data={data.monthlySeries} />
        <CategoryPieChart data={data.categoryBreakdown} />
        <ResponsibleDonutChart data={data.byResponsible} />
        <div className="xl:col-span-2">
          <YearlyLineChart data={data.yearlySeries} />
        </div>
      </section>
    </div>
  );
}

function Insight({
  label,
  month,
  field,
  invert = false,
}: {
  label: string;
  month: { key: string; expense: number; savings: number } | null;
  field: "expense" | "savings";
  invert?: boolean;
}) {
  if (!month) return null;
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold capitalize">{formatMonthYear(`${month.key}-01`)}</p>
      <p className={`mt-1 text-xl font-semibold tabular ${invert && month.savings < 0 ? "text-danger" : ""}`}>
        {formatCurrency(month[field])}
      </p>
    </Card>
  );
}

function InsightMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-xl font-semibold tabular">{value}</p>
    </Card>
  );
}
