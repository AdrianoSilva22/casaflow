import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { InstallmentPlan } from "@/domain/entities/installment-plan";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";
import { generateFinancialEntries } from "@/mocks/seed-financial-entries";
import { enrichWithCommitments } from "@/mocks/seed-commitments";
import { REFERENCE_DATE } from "@/constants/reference-date";

type MemoryState = {
  entries: FinancialEntry[];
  recurring: RecurringExpense[];
  plans: InstallmentPlan[];
  payments: PaymentHistory[];
};

const globalStore = globalThis as typeof globalThis & {
  __casaflowState?: MemoryState;
};

function seedState(): MemoryState {
  const seeded = enrichWithCommitments(generateFinancialEntries(REFERENCE_DATE), REFERENCE_DATE);
  return {
    entries: seeded.entries,
    recurring: seeded.recurring,
    plans: seeded.plans,
    payments: seeded.history,
  };
}

if (!globalStore.__casaflowState) {
  globalStore.__casaflowState = seedState();
}

function state() {
  return globalStore.__casaflowState!;
}

export function getMemoryEntries() {
  return state().entries;
}

export function setMemoryEntries(entries: FinancialEntry[]) {
  state().entries = entries;
}

export function getMemoryRecurring() {
  return state().recurring;
}

export function setMemoryRecurring(recurring: RecurringExpense[]) {
  state().recurring = recurring;
}

export function getMemoryPlans() {
  return state().plans;
}

export function setMemoryPlans(plans: InstallmentPlan[]) {
  state().plans = plans;
}

export function getMemoryPayments() {
  return state().payments;
}

export function setMemoryPayments(payments: PaymentHistory[]) {
  state().payments = payments;
}

export function resetMemoryEntries() {
  globalStore.__casaflowState = seedState();
}
