import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { DashboardSnapshot } from "@/domain/services/finance-analytics";
import type { CommitmentInsights, MonthSummary } from "@/domain/services/commitments";
import type { InstallmentPlanSummary } from "@/domain/services/installments";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import type { RecurringStatus } from "@/domain/value-objects/commitments";
import type {
  ListFinancialEntriesInput,
  PaginatedEntries,
} from "@/application/ports/financial-entry.repository";
import type { AuthSession } from "@/domain/entities/user";
import type { FinancialEntryFormValues } from "@/validators/financial-entry.schema";

export type DashboardResponse = DashboardSnapshot & { commitments: CommitmentInsights };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Não foi possível concluir a operação.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchFinances(input: ListFinancialEntriesInput = {}) {
  const params = new URLSearchParams();
  const filters = input.filters ?? {};

  if (filters.search) params.set("search", filters.search);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.responsible && filters.responsible !== "all")
    params.set("responsible", filters.responsible);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.commitmentKind && filters.commitmentKind !== "all")
    params.set("commitmentKind", filters.commitmentKind);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (input.sort) params.set("sort", input.sort);
  if (input.direction) params.set("direction", input.direction);
  if (input.page) params.set("page", String(input.page));
  if (input.pageSize) params.set("pageSize", String(input.pageSize));

  return request<PaginatedEntries>(`/api/finances?${params.toString()}`);
}

export function fetchFinance(id: string) {
  return request<FinancialEntry>(`/api/finances/${id}`);
}

export function createFinance(input: FinancialEntryDraft | FinancialEntryFormValues) {
  return request<FinancialEntry>("/api/finances", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function payFinance(id: string) {
  return request<FinancialEntry>(`/api/finances/${id}/pay`, { method: "POST" });
}

export function fetchInstallments() {
  return request<InstallmentPlanSummary[]>("/api/installments");
}

export function fetchRecurring() {
  return request<RecurringExpense[]>("/api/recurring");
}

export function updateRecurringStatus(id: string, status: RecurringStatus) {
  return request<RecurringExpense>(`/api/recurring/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function fetchMonthSummary(month: string) {
  return request<MonthSummary>(`/api/summary?month=${month}`);
}

export function fetchPaymentHistory(month?: string) {
  const query = month ? `?month=${month}` : "";
  return request<PaymentHistory[]>(`/api/history${query}`);
}

export function updateFinance(id: string, input: Partial<FinancialEntryDraft>) {
  return request<FinancialEntry>(`/api/finances/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteFinance(id: string) {
  return request<void>(`/api/finances/${id}`, { method: "DELETE" });
}

export function fetchDashboard() {
  return request<DashboardResponse>("/api/dashboard");
}

export function loginRequest(login: string, password: string) {
  return request<AuthSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export function logoutRequest() {
  return request<void>("/api/auth/logout", { method: "POST" });
}

export function fetchSession() {
  return request<AuthSession | null>("/api/auth/session");
}

export function fetchCalendar(from: string, to: string) {
  return fetchFinances({
    filters: { from, to },
    page: 1,
    pageSize: 500,
    sort: "dueDate",
    direction: "asc",
  });
}

export function fetchMonthlyReport(month: string) {
  return request<import("@/domain/services/monthly-report").MonthlyReportResult>(
    `/api/reports/monthly?month=${month}`,
  );
}
