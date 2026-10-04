import type { InstallmentPlan, InstallmentPlanDraft } from "@/domain/entities/installment-plan";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import type { RecurringExpense, RecurringExpenseDraft } from "@/domain/entities/recurring-expense";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import { DEFAULT_FAMILY_ID, prisma } from "@/infrastructure/db/prisma";
import { toDate, toPayment, toPlan, toRecurring } from "@/infrastructure/db/mappers";

export class PrismaCommitmentsRepository implements CommitmentsRepository {
  async listPlans() {
    const rows = await prisma.installmentPlan.findMany({
      where: { familyId: DEFAULT_FAMILY_ID },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toPlan);
  }

  async findPlan(id: string) {
    const row = await prisma.installmentPlan.findFirst({
      where: { id, familyId: DEFAULT_FAMILY_ID },
    });
    return row ? toPlan(row) : null;
  }

  async createPlan(input: InstallmentPlanDraft) {
    const row = await prisma.installmentPlan.create({
      data: {
        familyId: DEFAULT_FAMILY_ID,
        name: input.name,
        description: input.description ?? "",
        totalAmount: input.totalAmount,
        installmentCount: input.installmentCount,
        installmentAmount: input.installmentAmount,
        firstDueDate: toDate(input.firstDueDate),
        responsible: input.responsible,
        category: input.category,
        status: "active",
      },
    });
    return toPlan(row);
  }

  async updatePlan(id: string, input: Partial<InstallmentPlan>) {
    const current = await this.findPlan(id);
    if (!current) throw new Error("Parcelamento não encontrado.");

    const row = await prisma.installmentPlan.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        totalAmount: input.totalAmount,
        installmentCount: input.installmentCount,
        installmentAmount: input.installmentAmount,
        firstDueDate: input.firstDueDate ? toDate(input.firstDueDate) : undefined,
        responsible: input.responsible,
        category: input.category,
        status: input.status,
      },
    });
    return toPlan(row);
  }

  async listRecurring() {
    const rows = await prisma.recurringExpense.findMany({
      where: { familyId: DEFAULT_FAMILY_ID },
      orderBy: { dueDay: "asc" },
    });
    return rows.map(toRecurring);
  }

  async findRecurring(id: string) {
    const row = await prisma.recurringExpense.findFirst({
      where: { id, familyId: DEFAULT_FAMILY_ID },
    });
    return row ? toRecurring(row) : null;
  }

  async createRecurring(input: RecurringExpenseDraft) {
    const row = await prisma.recurringExpense.create({
      data: {
        familyId: DEFAULT_FAMILY_ID,
        name: input.name,
        description: input.description ?? "",
        amount: input.amount,
        dueDay: input.dueDay,
        category: input.category,
        responsible: input.responsible,
        status: input.status,
        startedAt: toDate(input.startedAt),
        endedAt: input.endedAt ? toDate(input.endedAt) : null,
      },
    });
    return toRecurring(row);
  }

  async updateRecurring(id: string, input: Partial<RecurringExpense>) {
    const current = await this.findRecurring(id);
    if (!current) throw new Error("Conta recorrente não encontrada.");

    const row = await prisma.recurringExpense.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        amount: input.amount,
        dueDay: input.dueDay,
        category: input.category,
        responsible: input.responsible,
        status: input.status,
        startedAt: input.startedAt ? toDate(input.startedAt) : undefined,
        endedAt: input.endedAt === null ? null : input.endedAt ? toDate(input.endedAt) : undefined,
      },
    });
    return toRecurring(row);
  }

  async listPayments() {
    const rows = await prisma.paymentHistory.findMany({
      where: { familyId: DEFAULT_FAMILY_ID },
      orderBy: { paidAt: "desc" },
    });
    return rows.map(toPayment);
  }

  async addPayment(payment: PaymentHistory) {
    const row = await prisma.paymentHistory.create({
      data: {
        id: payment.id,
        familyId: DEFAULT_FAMILY_ID,
        entryId: payment.entryId,
        name: payment.name,
        amount: payment.amount,
        paidAt: toDate(payment.paidAt),
        monthKey: payment.monthKey,
        kind: payment.kind,
        installmentLabel: payment.installmentLabel,
        recurringExpenseId: payment.recurringExpenseId,
        installmentPlanId: payment.installmentPlanId,
      },
    });
    return toPayment(row);
  }
}

export const commitmentsRepository = new PrismaCommitmentsRepository();
