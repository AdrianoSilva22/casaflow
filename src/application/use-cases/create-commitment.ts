import { addMonths, format, startOfMonth } from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import { buildInstallmentEntries, installmentAmount } from "@/domain/services/installments";
import { missingRecurringEntries } from "@/domain/services/recurring";
import type { Category, Responsible } from "@/domain/value-objects/enums";
import type { CommitmentKind } from "@/domain/value-objects/commitments";

export interface CreateCommitmentInput {
  name: string;
  description: string;
  amount: number;
  category: Category;
  dueDate: string;
  paymentDate: string | null;
  responsible: Responsible;
  type: "income" | "expense";
  status: "pending" | "paid" | "overdue" | "cancelled";
  notes: string;
  commitmentKind: CommitmentKind;
  dueDay?: number;
  installmentCount?: number;
  totalAmount?: number;
}

export async function createCommitment(
  entriesRepo: FinancialEntryRepository,
  commitmentsRepo: CommitmentsRepository,
  input: CreateCommitmentInput,
  reference = new Date(),
): Promise<FinancialEntry> {
  if (input.commitmentKind === "installment") {
    const count = input.installmentCount ?? 2;
    const total = input.totalAmount || input.amount * count;
    const plan = await commitmentsRepo.createPlan({
      name: input.name,
      description: input.description,
      totalAmount: total,
      installmentCount: count,
      installmentAmount: installmentAmount(total, count),
      firstDueDate: input.dueDate,
      responsible: input.responsible,
      category: input.category,
    });

    const drafts = buildInstallmentEntries(plan, new Date(0));
    let first: FinancialEntry | null = null;
    for (const draft of drafts) {
      const created = await entriesRepo.create({
        ...draft,
        status: "pending",
        paymentDate: null,
      });
      if (!first) first = created;
    }
    return first!;
  }

  if (input.commitmentKind === "recurring") {
    const dueDay = input.dueDay || Number(input.dueDate.slice(8, 10)) || 10;
    const recurring = await commitmentsRepo.createRecurring({
      name: input.name,
      description: input.description,
      amount: input.amount,
      dueDay,
      category: input.category,
      responsible: input.responsible,
      status: "active",
      startedAt: input.dueDate || format(reference, "yyyy-MM-dd"),
      endedAt: null,
    });

    const start = startOfMonth(reference);
    const drafts = missingRecurringEntries([recurring], [], start, addMonths(start, 1), reference);
    let first: FinancialEntry | null = null;
    for (const draft of drafts) {
      const created = await entriesRepo.create(draft);
      if (!first) first = created;
    }
    return first!;
  }

  return entriesRepo.create({
    name: input.name,
    description: input.description,
    amount: input.amount,
    dueDate: input.dueDate,
    paymentDate: input.status === "paid" ? input.paymentDate ?? input.dueDate : input.paymentDate,
    type: input.type,
    status: input.status,
    responsible: input.responsible,
    category: input.category,
    notes: input.notes,
    commitmentKind: "once",
    recurringExpenseId: null,
    installmentPlanId: null,
    installmentNumber: null,
    installmentCount: null,
  });
}
