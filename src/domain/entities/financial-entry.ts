import type { Category, EntryStatus, EntryType, Responsible } from "@/domain/value-objects/enums";
import type { CommitmentKind } from "@/domain/value-objects/commitments";

export interface FinancialEntry {
  id: string;
  name: string;
  description: string;
  amount: number;
  dueDate: string;
  paymentDate: string | null;
  type: EntryType;
  status: EntryStatus;
  responsible: Responsible;
  category: Category;
  notes: string;
  commitmentKind: CommitmentKind;
  recurringExpenseId: string | null;
  installmentPlanId: string | null;
  installmentNumber: number | null;
  installmentCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export type FinancialEntryDraft = Omit<FinancialEntry, "id" | "createdAt" | "updatedAt">;
