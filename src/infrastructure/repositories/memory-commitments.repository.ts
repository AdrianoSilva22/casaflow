import type { InstallmentPlan, InstallmentPlanDraft } from "@/domain/entities/installment-plan";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import type { RecurringExpense, RecurringExpenseDraft } from "@/domain/entities/recurring-expense";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import {
  getMemoryPayments,
  getMemoryPlans,
  getMemoryRecurring,
  setMemoryPayments,
  setMemoryPlans,
  setMemoryRecurring,
} from "@/infrastructure/db/memory-store";

function nowIso() {
  return new Date().toISOString();
}

export class MemoryCommitmentsRepository implements CommitmentsRepository {
  async listPlans() {
    return getMemoryPlans().map((item) => ({ ...item }));
  }

  async findPlan(id: string) {
    return getMemoryPlans().find((item) => item.id === id) ?? null;
  }

  async createPlan(input: InstallmentPlanDraft) {
    const created: InstallmentPlan = {
      ...input,
      id: `plan_${crypto.randomUUID().slice(0, 8)}`,
      status: "active",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setMemoryPlans([created, ...getMemoryPlans()]);
    return created;
  }

  async updatePlan(id: string, input: Partial<InstallmentPlan>) {
    const current = getMemoryPlans();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Parcelamento não encontrado.");
    const updated = { ...current[index], ...input, updatedAt: nowIso() };
    const next = [...current];
    next[index] = updated;
    setMemoryPlans(next);
    return updated;
  }

  async listRecurring() {
    return getMemoryRecurring().map((item) => ({ ...item }));
  }

  async findRecurring(id: string) {
    return getMemoryRecurring().find((item) => item.id === id) ?? null;
  }

  async createRecurring(input: RecurringExpenseDraft) {
    const created: RecurringExpense = {
      ...input,
      id: `rec_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setMemoryRecurring([created, ...getMemoryRecurring()]);
    return created;
  }

  async updateRecurring(id: string, input: Partial<RecurringExpense>) {
    const current = getMemoryRecurring();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Conta recorrente não encontrada.");
    const updated = { ...current[index], ...input, updatedAt: nowIso() };
    const next = [...current];
    next[index] = updated;
    setMemoryRecurring(next);
    return updated;
  }

  async listPayments() {
    return getMemoryPayments().map((item) => ({ ...item }));
  }

  async addPayment(payment: PaymentHistory) {
    setMemoryPayments([payment, ...getMemoryPayments()]);
    return payment;
  }
}

export const commitmentsRepository = new MemoryCommitmentsRepository();
