import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import { getMemoryEntries, setMemoryEntries } from "@/infrastructure/db/memory-store";

function nowIso() {
  return new Date().toISOString();
}

function clone(entries: FinancialEntry[]) {
  return entries.map((entry) => ({ ...entry }));
}

export class MemoryFinancialEntryRepository implements FinancialEntryRepository {
  async list(): Promise<FinancialEntry[]> {
    return clone(getMemoryEntries());
  }

  async findById(id: string): Promise<FinancialEntry | null> {
    return getMemoryEntries().find((entry) => entry.id === id) ?? null;
  }

  async create(input: FinancialEntryDraft): Promise<FinancialEntry> {
    const created: FinancialEntry = {
      ...input,
      commitmentKind: input.commitmentKind ?? "once",
      recurringExpenseId: input.recurringExpenseId ?? null,
      installmentPlanId: input.installmentPlanId ?? null,
      installmentNumber: input.installmentNumber ?? null,
      installmentCount: input.installmentCount ?? null,
      id: `ent_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setMemoryEntries([created, ...getMemoryEntries()]);
    return created;
  }

  async update(id: string, input: Partial<FinancialEntryDraft>): Promise<FinancialEntry> {
    const current = getMemoryEntries();
    const index = current.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error("Lançamento não encontrado.");
    }

    const updated: FinancialEntry = {
      ...current[index],
      ...input,
      updatedAt: nowIso(),
    };
    const next = [...current];
    next[index] = updated;
    setMemoryEntries(next);
    return updated;
  }

  async remove(id: string): Promise<void> {
    setMemoryEntries(getMemoryEntries().filter((entry) => entry.id !== id));
  }
}

export const financialEntryRepository = new MemoryFinancialEntryRepository();
