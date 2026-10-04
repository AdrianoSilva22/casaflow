import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import { monthSummary } from "@/domain/services/commitments";
import { syncCommitments } from "@/application/use-cases/sync-commitments";

export async function getMonthSummary(
  entriesRepo: FinancialEntryRepository,
  commitmentsRepo: CommitmentsRepository,
  month: string,
  reference = new Date(),
) {
  await syncCommitments(entriesRepo, commitmentsRepo, reference);
  const entries = await entriesRepo.list();
  return monthSummary(entries, month, reference);
}
