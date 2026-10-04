import type {
  FinancialEntry as PrismaEntry,
  InstallmentPlan as PrismaPlan,
  PaymentHistory as PrismaPayment,
  RecurringExpense as PrismaRecurring,
  User as PrismaUser,
} from "@prisma/client";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { InstallmentPlan } from "@/domain/entities/installment-plan";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";
import type { User } from "@/domain/entities/user";

function money(value: { toString(): string } | number) {
  return Number(value);
}

function day(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function toFinancialEntry(row: PrismaEntry): FinancialEntry {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    amount: money(row.amount),
    dueDate: day(row.dueDate),
    paymentDate: row.paymentDate ? day(row.paymentDate) : null,
    type: row.type,
    status: row.status,
    responsible: row.responsible,
    category: row.category as FinancialEntry["category"],
    notes: row.notes,
    commitmentKind: row.commitmentKind,
    recurringExpenseId: row.recurringExpenseId,
    installmentPlanId: row.installmentPlanId,
    installmentNumber: row.installmentNumber,
    installmentCount: row.installmentCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toRecurring(row: PrismaRecurring): RecurringExpense {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    amount: money(row.amount),
    dueDay: row.dueDay,
    category: row.category as RecurringExpense["category"],
    responsible: row.responsible,
    status: row.status,
    startedAt: day(row.startedAt),
    endedAt: row.endedAt ? day(row.endedAt) : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toPlan(row: PrismaPlan): InstallmentPlan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    totalAmount: money(row.totalAmount),
    installmentCount: row.installmentCount,
    installmentAmount: money(row.installmentAmount),
    firstDueDate: day(row.firstDueDate),
    responsible: row.responsible,
    category: row.category as InstallmentPlan["category"],
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toPayment(row: PrismaPayment): PaymentHistory {
  return {
    id: row.id,
    entryId: row.entryId,
    name: row.name,
    amount: money(row.amount),
    paidAt: day(row.paidAt),
    monthKey: row.monthKey,
    kind: row.kind,
    installmentLabel: row.installmentLabel,
    recurringExpenseId: row.recurringExpenseId,
    installmentPlanId: row.installmentPlanId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toUser(row: PrismaUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarInitials: row.avatarInitials,
    color: row.color,
  };
}

export function toDate(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}
