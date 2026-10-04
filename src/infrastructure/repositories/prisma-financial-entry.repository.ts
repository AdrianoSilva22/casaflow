import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import { DEFAULT_FAMILY_ID, prisma } from "@/infrastructure/db/prisma";
import { toDate, toFinancialEntry } from "@/infrastructure/db/mappers";

export class PrismaFinancialEntryRepository implements FinancialEntryRepository {
  async list(): Promise<FinancialEntry[]> {
    const rows = await prisma.financialEntry.findMany({
      where: { familyId: DEFAULT_FAMILY_ID },
      orderBy: { dueDate: "desc" },
    });
    return rows.map(toFinancialEntry);
  }

  async findById(id: string): Promise<FinancialEntry | null> {
    const row = await prisma.financialEntry.findFirst({
      where: { id, familyId: DEFAULT_FAMILY_ID },
    });
    return row ? toFinancialEntry(row) : null;
  }

  async create(input: FinancialEntryDraft): Promise<FinancialEntry> {
    const row = await prisma.financialEntry.create({
      data: {
        familyId: DEFAULT_FAMILY_ID,
        name: input.name,
        description: input.description ?? "",
        amount: input.amount,
        dueDate: toDate(input.dueDate),
        paymentDate: input.paymentDate ? toDate(input.paymentDate) : null,
        type: input.type,
        status: input.status,
        responsible: input.responsible,
        category: input.category,
        notes: input.notes ?? "",
        commitmentKind: input.commitmentKind ?? "once",
        recurringExpenseId: input.recurringExpenseId,
        installmentPlanId: input.installmentPlanId,
        installmentNumber: input.installmentNumber,
        installmentCount: input.installmentCount,
      },
    });
    return toFinancialEntry(row);
  }

  async update(id: string, input: Partial<FinancialEntryDraft>): Promise<FinancialEntry> {
    const current = await this.findById(id);
    if (!current) throw new Error("Lançamento não encontrado.");

    const row = await prisma.financialEntry.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        amount: input.amount,
        dueDate: input.dueDate ? toDate(input.dueDate) : undefined,
        paymentDate:
          input.paymentDate === null ? null : input.paymentDate ? toDate(input.paymentDate) : undefined,
        type: input.type,
        status: input.status,
        responsible: input.responsible,
        category: input.category,
        notes: input.notes,
        commitmentKind: input.commitmentKind,
        recurringExpenseId: input.recurringExpenseId,
        installmentPlanId: input.installmentPlanId,
        installmentNumber: input.installmentNumber,
        installmentCount: input.installmentCount,
      },
    });
    return toFinancialEntry(row);
  }

  async remove(id: string): Promise<void> {
    await prisma.financialEntry.delete({ where: { id } });
  }
}

export const financialEntryRepository = new PrismaFinancialEntryRepository();
