import { describe, expect, it } from "vitest";
import { buildDashboardSnapshot } from "@/domain/services/finance-analytics";
import { generateFinancialEntries } from "@/mocks/seed-financial-entries";

describe("buildDashboardSnapshot", () => {
  const entries = generateFinancialEntries(new Date("2026-09-10"));
  const snapshot = buildDashboardSnapshot(entries, new Date("2026-09-10"));

  it("gera histórico de 24 meses", () => {
    expect(snapshot.monthlySeries.length).toBeGreaterThanOrEqual(24);
  });

  it("calcula receitas e despesas do mês corrente", () => {
    expect(snapshot.monthIncome).toBeGreaterThan(0);
    expect(snapshot.monthExpense).toBeGreaterThan(0);
  });

  it("identifica maior e menor gasto mensal", () => {
    expect(snapshot.maxMonthExpense?.expense ?? 0).toBeGreaterThan(snapshot.minMonthExpense?.expense ?? 0);
  });

  it("separa gastos por responsável", () => {
    expect(snapshot.byResponsible.adriano).toBeGreaterThan(0);
    expect(snapshot.byResponsible.adrielle).toBeGreaterThan(0);
    expect(snapshot.byResponsible.both).toBeGreaterThan(0);
  });
});
