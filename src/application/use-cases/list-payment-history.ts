import type { CommitmentsRepository } from "@/application/ports/commitments.repository";

export async function listPaymentHistory(commitmentsRepo: CommitmentsRepository, month?: string) {
  const items = await commitmentsRepo.listPayments();
  const filtered = month ? items.filter((item) => item.monthKey === month) : items;
  return filtered.sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}
