import { addMonths, startOfMonth } from "date-fns";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import { missingRecurringEntries } from "@/domain/services/recurring";

export async function syncCommitments(
  entriesRepo: FinancialEntryRepository,
  commitmentsRepo: CommitmentsRepository,
  reference = new Date(),
) {
  const [entries, recurring] = await Promise.all([entriesRepo.list(), commitmentsRepo.listRecurring()]);
  const missing = missingRecurringEntries(
    recurring,
    entries,
    startOfMonth(reference),
    addMonths(startOfMonth(reference), 1),
    reference,
  );

  for (const draft of missing) {
    await entriesRepo.create(draft);
  }

  return missing.length;
}
