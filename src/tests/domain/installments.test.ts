import { describe, expect, it } from "vitest";
import { buildInstallmentEntries, installmentAmount, summarizePlan } from "@/domain/services/installments";
import { markEntryPaid, paymentClosesPlan } from "@/domain/services/payments";
import { missingRecurringEntries } from "@/domain/services/recurring";
import type { InstallmentPlan } from "@/domain/entities/installment-plan";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";

const plan: InstallmentPlan = {
  id: "plan_note",
  name: "Notebook Dell",
  description: "Compra",
  totalAmount: 6000,
  installmentCount: 6,
  installmentAmount: 1000,
  firstDueDate: "2026-09-15",
  responsible: "adriano",
  category: "credit_card",
  status: "active",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

describe("parcelamentos", () => {
  it("gera todas as parcelas automaticamente", () => {
    const entries = buildInstallmentEntries(plan, new Date(0));
    expect(entries).toHaveLength(6);
    expect(entries[0].installmentNumber).toBe(1);
    expect(entries[5].installmentNumber).toBe(6);
    expect(entries[5].dueDate).toBe("2027-02-15");
    expect(installmentAmount(6000, 6)).toBe(1000);
  });

  it("encerra o plano na última parcela paga", () => {
    const drafts = buildInstallmentEntries(plan, new Date(0));
    const entries = drafts.map((draft, index) => ({
      ...draft,
      id: `e${index}`,
      createdAt: "",
      updatedAt: "",
      status: index < 5 ? ("paid" as const) : ("pending" as const),
    }));
    const last = markEntryPaid(entries[5], "2027-02-15");
    expect(paymentClosesPlan(last)).toBe(true);
    const summary = summarizePlan(plan, [...entries.slice(0, 5), last]);
    expect(summary.status).toBe("closed");
    expect(summary.remainingCount).toBe(0);
  });
});

describe("recorrentes", () => {
  it("gera o mês seguinte sem novo cadastro", () => {
    const recurring: RecurringExpense[] = [
      {
        id: "rec_net",
        name: "Internet Vivo",
        description: "",
        amount: 99.9,
        dueDay: 10,
        category: "internet",
        responsible: "both",
        status: "active",
        startedAt: "2026-09-01",
        endedAt: null,
        createdAt: "",
        updatedAt: "",
      },
    ];
    const created = missingRecurringEntries(
      recurring,
      [],
      new Date(2026, 9, 1),
      new Date(2026, 9, 31),
      new Date(2026, 8, 10),
    );
    expect(created).toHaveLength(1);
    expect(created[0].dueDate).toBe("2026-10-10");
    expect(created[0].name).toBe("Internet Vivo");
  });
});
