import { format } from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import { isLastInstallment } from "@/domain/services/display-status";
import { installmentLabel } from "@/domain/services/installments";
import { monthKey } from "@/lib/format";

export function buildPaymentHistory(entry: FinancialEntry, paidAt: string): PaymentHistory {
  return {
    id: `pay_${entry.id}_${paidAt}`,
    entryId: entry.id,
    name: entry.name,
    amount: entry.amount,
    paidAt,
    monthKey: monthKey(paidAt),
    kind: entry.commitmentKind,
    installmentLabel: installmentLabel(entry),
    recurringExpenseId: entry.recurringExpenseId,
    installmentPlanId: entry.installmentPlanId,
    createdAt: new Date().toISOString(),
  };
}

export function markEntryPaid(entry: FinancialEntry, paidAt = format(new Date(), "yyyy-MM-dd")): FinancialEntry {
  return {
    ...entry,
    status: "paid",
    paymentDate: paidAt,
    updatedAt: new Date().toISOString(),
  };
}

export function paymentClosesPlan(entry: FinancialEntry) {
  return isLastInstallment(entry);
}
