import type { Category, Responsible } from "@/domain/value-objects/enums";
import type { RecurringStatus } from "@/domain/value-objects/commitments";

export interface RecurringExpense {
  id: string;
  name: string;
  description: string;
  amount: number;
  dueDay: number;
  category: Category;
  responsible: Responsible;
  status: RecurringStatus;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RecurringExpenseDraft = Omit<RecurringExpense, "id" | "createdAt" | "updatedAt">;
