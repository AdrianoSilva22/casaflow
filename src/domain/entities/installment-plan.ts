import type { Category, Responsible } from "@/domain/value-objects/enums";
import type { PlanStatus } from "@/domain/value-objects/commitments";

export interface InstallmentPlan {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  responsible: Responsible;
  category: Category;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export type InstallmentPlanDraft = Omit<InstallmentPlan, "id" | "createdAt" | "updatedAt" | "status">;
