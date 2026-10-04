import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import { withResolvedStatus } from "@/domain/services/entry-status";

export async function createFinancialEntry(
  repository: FinancialEntryRepository,
  input: FinancialEntryDraft,
): Promise<FinancialEntry> {
  const created = await repository.create({
    ...input,
    paymentDate: input.status === "paid" ? input.paymentDate ?? input.dueDate : input.paymentDate,
  });
  return withResolvedStatus(created);
}
