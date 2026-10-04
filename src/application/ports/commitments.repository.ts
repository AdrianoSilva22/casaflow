import type { InstallmentPlan, InstallmentPlanDraft } from "@/domain/entities/installment-plan";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import type { RecurringExpense, RecurringExpenseDraft } from "@/domain/entities/recurring-expense";

export interface CommitmentsRepository {
  listPlans(): Promise<InstallmentPlan[]>;
  findPlan(id: string): Promise<InstallmentPlan | null>;
  createPlan(input: InstallmentPlanDraft): Promise<InstallmentPlan>;
  updatePlan(id: string, input: Partial<InstallmentPlan>): Promise<InstallmentPlan>;
  listRecurring(): Promise<RecurringExpense[]>;
  findRecurring(id: string): Promise<RecurringExpense | null>;
  createRecurring(input: RecurringExpenseDraft): Promise<RecurringExpense>;
  updateRecurring(id: string, input: Partial<RecurringExpense>): Promise<RecurringExpense>;
  listPayments(): Promise<PaymentHistory[]>;
  addPayment(payment: PaymentHistory): Promise<PaymentHistory>;
}
