import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";

export async function deleteFinancialEntry(repository: FinancialEntryRepository, id: string) {
  await repository.remove(id);
}
