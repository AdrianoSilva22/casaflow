import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import { summarizePlan } from "@/domain/services/installments";

export async function listInstallmentPlans(
  entriesRepo: FinancialEntryRepository,
  commitmentsRepo: CommitmentsRepository,
  reference = new Date(),
) {
  const [plans, entries] = await Promise.all([commitmentsRepo.listPlans(), entriesRepo.list()]);
  return plans
    .map((plan) => summarizePlan(plan, entries, reference))
    .sort((a, b) => Number(a.status === "closed") - Number(b.status === "closed"));
}
