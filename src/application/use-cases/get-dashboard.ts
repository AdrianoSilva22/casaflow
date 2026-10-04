import { buildDashboardSnapshot } from "@/domain/services/finance-analytics";
import { buildCommitmentInsights } from "@/domain/services/commitments";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import { syncCommitments } from "@/application/use-cases/sync-commitments";

export async function getDashboard(
  entriesRepo: FinancialEntryRepository,
  commitmentsRepo: CommitmentsRepository,
  reference = new Date(),
) {
  await syncCommitments(entriesRepo, commitmentsRepo, reference);
  const [entries, plans, recurring] = await Promise.all([
    entriesRepo.list(),
    commitmentsRepo.listPlans(),
    commitmentsRepo.listRecurring(),
  ]);

  return {
    ...buildDashboardSnapshot(entries, reference),
    commitments: buildCommitmentInsights(entries, plans, recurring, reference),
  };
}
