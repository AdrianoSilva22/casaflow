import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import { withResolvedStatus } from "@/domain/services/entry-status";

export async function updateFinancialEntry(
  repository: FinancialEntryRepository,
  id: string,
  input: Partial<FinancialEntryDraft>,
): Promise<FinancialEntry> {
  const updated = await repository.update(id, input);
  return withResolvedStatus(updated);
}
