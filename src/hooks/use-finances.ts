"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFinance,
  deleteFinance,
  fetchFinance,
  fetchFinances,
  fetchInstallments,
  fetchMonthSummary,
  fetchPaymentHistory,
  fetchRecurring,
  fetchMonthlyReport,
  payFinance,
  updateFinance,
  updateRecurringStatus,
} from "@/lib/api";
import type { FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { FinancialEntryFormValues } from "@/validators/financial-entry.schema";
import type { ListFinancialEntriesInput } from "@/application/ports/financial-entry.repository";
import type { RecurringStatus } from "@/domain/value-objects/commitments";

export function useFinances(input: ListFinancialEntriesInput) {
  return useQuery({
    queryKey: ["finances", input],
    queryFn: () => fetchFinances(input),
  });
}

export function useFinance(id?: string) {
  return useQuery({
    queryKey: ["finance", id],
    queryFn: () => fetchFinance(id!),
    enabled: Boolean(id),
  });
}

export function useFinanceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["finances"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["calendar"] });
    void queryClient.invalidateQueries({ queryKey: ["installments"] });
    void queryClient.invalidateQueries({ queryKey: ["recurring"] });
    void queryClient.invalidateQueries({ queryKey: ["summary"] });
    void queryClient.invalidateQueries({ queryKey: ["history"] });
  };

  const create = useMutation({
    mutationFn: (input: FinancialEntryDraft | FinancialEntryFormValues) => createFinance(input),
    onSuccess: invalidate,
  });

  const pay = useMutation({
    mutationFn: (id: string) => payFinance(id),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<FinancialEntryDraft> }) =>
      updateFinance(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFinance(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, pay };
}

export function useInstallments() {
  return useQuery({ queryKey: ["installments"], queryFn: fetchInstallments });
}

export function useRecurring() {
  return useQuery({ queryKey: ["recurring"], queryFn: fetchRecurring });
}

export function useRecurringMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecurringStatus }) =>
      updateRecurringStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recurring"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });
}

export function useMonthSummary(month: string) {
  return useQuery({
    queryKey: ["summary", month],
    queryFn: () => fetchMonthSummary(month),
  });
}

export function usePaymentHistory(month?: string) {
  return useQuery({
    queryKey: ["history", month],
    queryFn: () => fetchPaymentHistory(month),
  });
}

export function useMonthlyReport(month: string) {
  return useQuery({
    queryKey: ["monthly-report", month],
    queryFn: () => fetchMonthlyReport(month),
  });
}
