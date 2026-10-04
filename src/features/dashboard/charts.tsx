"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_COLORS } from "@/constants/categories";
import type { DashboardSnapshot } from "@/domain/services/finance-analytics";
import { CATEGORY_LABELS, RESPONSIBLE_LABELS } from "@/domain/value-objects/enums";
import { formatCurrency, formatShortMonth } from "@/lib/format";

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid var(--border)",
  background: "var(--card)",
};

function moneyTooltip(value: unknown) {
  return formatCurrency(Number(value ?? 0));
}

export function IncomeExpenseChart({ data }: { data: DashboardSnapshot["monthlySeries"] }) {
  const series = data.slice(-12).map((item) => ({
    ...item,
    label: formatShortMonth(`${item.key}-01`),
  }));

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Receitas x Despesas</CardTitle>
          <CardDescription>Comparativo dos últimos 12 meses</CardDescription>
        </div>
      </CardHeader>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={series}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={moneyTooltip} />
          <Legend />
          <Bar dataKey="income" name="Receitas" fill="#06B6D4" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expense" name="Despesas" fill="#7C3AED" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function MonthlyTrendChart({ data }: { data: DashboardSnapshot["monthlySeries"] }) {
  const series = data.slice(-12).map((item) => ({
    ...item,
    label: formatShortMonth(`${item.key}-01`),
  }));

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Evolução financeira</CardTitle>
          <CardDescription>Saldo mensal acumulado do período</CardDescription>
        </div>
      </CardHeader>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={series}>
          <defs>
            <linearGradient id="savings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip contentStyle={tooltipStyle} formatter={moneyTooltip} />
          <Area type="monotone" dataKey="savings" name="Economia" stroke="#7C3AED" fill="url(#savings)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CategoryPieChart({ data }: { data: DashboardSnapshot["categoryBreakdown"] }) {
  const series = data.slice(0, 6).map((item) => ({
    name: CATEGORY_LABELS[item.category],
    value: item.amount,
    color: CATEGORY_COLORS[item.category],
  }));

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Categorias</CardTitle>
          <CardDescription>Distribuição de gastos do mês</CardDescription>
        </div>
      </CardHeader>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={series} dataKey="value" nameKey="name" innerRadius={0} outerRadius={90} paddingAngle={2}>
            {series.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={moneyTooltip} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ResponsibleDonutChart({ data }: { data: DashboardSnapshot["byResponsible"] }) {
  const series = Object.entries(data).map(([key, value]) => ({
    name: RESPONSIBLE_LABELS[key as keyof typeof RESPONSIBLE_LABELS],
    value,
  }));
  const colors = ["#7C3AED", "#06B6D4", "#22C55E"];

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Gastos por responsável</CardTitle>
          <CardDescription>Adriano, Adrielle e ambos</CardDescription>
        </div>
      </CardHeader>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={series} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
            {series.map((item, index) => (
              <Cell key={item.name} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={moneyTooltip} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function YearlyLineChart({ data }: { data: DashboardSnapshot["yearlySeries"] }) {
  return (
    <Card className="h-[360px]">
      <CardHeader>
        <div>
          <CardTitle>Evolução anual</CardTitle>
          <CardDescription>Receitas e despesas por ano</CardDescription>
        </div>
      </CardHeader>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip contentStyle={tooltipStyle} formatter={moneyTooltip} />
          <Legend />
          <Line type="monotone" dataKey="income" name="Receitas" stroke="#06B6D4" strokeWidth={3} />
          <Line type="monotone" dataKey="expense" name="Despesas" stroke="#7C3AED" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
