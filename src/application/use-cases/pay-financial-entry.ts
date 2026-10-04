import { format } from "date-fns";
import type { FinancialEntryRepository } from "@/application/ports/financial-entry.repository";
import type { CommitmentsRepository } from "@/application/ports/commitments.repository";
import { buildPaymentHistory, markEntryPaid, paymentClosesPlan } from "@/domain/services/payments";
import { summarizePlan } from "@/domain/services/installments";

export async function payFinancialEntry(
  entriesRepo: FinancialEntryRepository,
  commitmentsRepo: CommitmentsRepository,
  id: string,
  paidAt = format(new Date(), "yyyy-MM-dd"),
) {
  const current = await entriesRepo.findById(id);
  if (!current) throw new Error("Lançamento não encontrado.");

  const paid = await entriesRepo.update(id, markEntryPaid(current, paidAt));
  await commitmentsRepo.addPayment(buildPaymentHistory(paid, paidAt));

  if (paid.installmentPlanId && paymentClosesPlan(paid)) {
    const [plan, entries] = await Promise.all([
      commitmentsRepo.findPlan(paid.installmentPlanId),
      entriesRepo.list(),
    ]);
    if (plan) {
      const summary = summarizePlan(plan, entries);
      if (summary.remainingCount === 0) {
        await commitmentsRepo.updatePlan(plan.id, { status: "closed" });
      }
    }
  }

  return paid;
}
