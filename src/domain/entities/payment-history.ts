import type { CommitmentKind } from "@/domain/value-objects/commitments";

export interface PaymentHistory {
  id: string;
  entryId: string;
  name: string;
  amount: number;
  paidAt: string;
  monthKey: string;
  kind: CommitmentKind;
  installmentLabel: string | null;
  recurringExpenseId: string | null;
  installmentPlanId: string | null;
  createdAt: string;
}
