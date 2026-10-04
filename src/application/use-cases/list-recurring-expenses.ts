import type { CommitmentsRepository } from "@/application/ports/commitments.repository";

export async function listRecurringExpenses(commitmentsRepo: CommitmentsRepository) {
  const items = await commitmentsRepo.listRecurring();
  return items.sort((a, b) => a.dueDay - b.dueDay);
}
