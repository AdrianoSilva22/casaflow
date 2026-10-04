"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  ENTRY_STATUSES,
  ENTRY_STATUS_LABELS,
  ENTRY_TYPE_LABELS,
  ENTRY_TYPES,
  RESPONSIBLE_LABELS,
  RESPONSIBLES,
} from "@/domain/value-objects/enums";
import { COMMITMENT_KIND_LABELS, COMMITMENT_KINDS } from "@/domain/value-objects/commitments";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import {
  financialEntrySchema,
  type FinancialEntryFormValues,
} from "@/validators/financial-entry.schema";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/format";
import { installmentAmount } from "@/domain/services/installments";

function getTodayString() {
  return format(new Date(), "yyyy-MM-dd");
}

const defaultValues: FinancialEntryFormValues = {
  name: "",
  description: "",
  amount: 0,
  category: "other",
  dueDate: getTodayString(),
  paymentDate: "",
  responsible: "both",
  type: "expense",
  status: "pending",
  notes: "",
  commitmentKind: "once",
  dueDay: 10,
  installmentCount: 6,
  totalAmount: 0,
};

export function FinancialForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: FinancialEntry;
  onSubmit: (values: FinancialEntryFormValues) => Promise<void> | void;
  submitting?: boolean;
  submitLabel: string;
}) {
  const form = useForm<FinancialEntryFormValues>({
    resolver: zodResolver(financialEntrySchema),
    defaultValues: initial
      ? {
          ...defaultValues,
          name: initial.name,
          description: initial.description,
          amount: initial.amount,
          category: initial.category,
          dueDate: initial.dueDate || getTodayString(),
          paymentDate: initial.paymentDate ?? "",
          responsible: initial.responsible,
          type: initial.type,
          status: initial.status === "overdue" ? "pending" : initial.status,
          notes: initial.notes,
          commitmentKind: initial.commitmentKind,
          installmentCount: initial.installmentCount ?? 6,
        }
      : defaultValues,
  });

  const kind = useWatch({ control: form.control, name: "commitmentKind" });
  const totalAmount = useWatch({ control: form.control, name: "totalAmount" });
  const installmentCount = useWatch({ control: form.control, name: "installmentCount" });
  const dueDay = useWatch({ control: form.control, name: "dueDay" });
  const preview =
    totalAmount && installmentCount ? installmentAmount(totalAmount, installmentCount) : 0;

  useEffect(() => {
    form.setFocus("name");
  }, [form]);

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(
        (values) => onSubmit(values),
        (errors) => console.warn("Erros de validação no formulário:", errors),
      )}
    >
      {hasErrors ? (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-xs text-danger space-y-1.5">
          <p className="font-semibold">Preencha os campos obrigatórios para continuar:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.entries(form.formState.errors).map(([key, err]) => (
              <li key={key}>{err?.message?.toString() || key}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {!initial ? (
        <div>
          <Label>Tipo de compromisso</Label>
          <Select {...form.register("commitmentKind")}>
            {COMMITMENT_KINDS.map((item) => (
              <option key={item} value={item}>
                {COMMITMENT_KIND_LABELS[item]}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            {kind === "installment"
              ? "O sistema cria todas as parcelas automaticamente."
              : kind === "recurring"
                ? "Repete todo mês até você encerrar."
                : "Um único vencimento, depois vai para o histórico."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            placeholder={kind === "installment" ? "Ex.: Notebook Dell" : "Ex.: Internet Vivo"}
            {...form.register("name")}
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" placeholder="Detalhe rápido" {...form.register("description")} />
        </div>

        {kind === "installment" && !initial ? (
          <>
            <div>
              <Label>Valor total</Label>
              <Controller
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <CurrencyInput value={field.value ?? 0} onChange={field.onChange} />
                )}
              />
              <FieldError>{form.formState.errors.totalAmount?.message}</FieldError>
            </div>
            <div>
              <Label>Quantidade de parcelas</Label>
              <Input type="number" min={2} max={60} {...form.register("installmentCount")} />
              <FieldError>{form.formState.errors.installmentCount?.message}</FieldError>
            </div>
            <div className="md:col-span-2 rounded-2xl bg-primary/8 px-4 py-3 text-sm">
              O sistema vai gerar <strong>{installmentCount || 0}x</strong> de{" "}
              <strong>{formatCurrency(preview)}</strong>. Você não cadastra parcela por parcela.
            </div>
          </>
        ) : (
          <div>
            <Label>Valor</Label>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput id="amount" value={field.value} onChange={field.onChange} />
              )}
            />
            <FieldError>{form.formState.errors.amount?.message}</FieldError>
          </div>
        )}

        <div>
          <Label>Categoria</Label>
          <Select {...form.register("category")}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </Select>
        </div>

        {kind === "recurring" && !initial ? (
          <div>
            <Label>Dia de vencimento</Label>
            <Input type="number" min={1} max={31} {...form.register("dueDay")} />
            <p className="mt-1 text-xs text-muted-foreground">Todo dia {dueDay || 10}</p>
            <FieldError>{form.formState.errors.dueDay?.message}</FieldError>
          </div>
        ) : (
          <div>
            <Label>{kind === "installment" ? "Primeiro vencimento" : "Vencimento"}</Label>
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
            />
            <FieldError>{form.formState.errors.dueDate?.message}</FieldError>
          </div>
        )}

        {kind === "once" || initial ? (
          <div>
            <Label>Pagamento</Label>
            <Controller
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Opcional" />
              )}
            />
          </div>
        ) : null}

        <div>
          <Label>Responsável</Label>
          <Select {...form.register("responsible")}>
            {RESPONSIBLES.map((item) => (
              <option key={item} value={item}>
                {RESPONSIBLE_LABELS[item]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Tipo</Label>
          <Select {...form.register("type")}>
            {ENTRY_TYPES.map((item) => (
              <option key={item} value={item}>
                {ENTRY_TYPE_LABELS[item]}
              </option>
            ))}
          </Select>
        </div>
        {kind === "once" || initial ? (
          <div>
            <Label>Status</Label>
            <Select {...form.register("status")}>
              {ENTRY_STATUSES.filter((item) => item !== "overdue").map((item) => (
                <option key={item} value={item}>
                  {ENTRY_STATUS_LABELS[item]}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        <div className="md:col-span-2">
          <Label htmlFor="notes">Observação</Label>
          <Textarea
            id="notes"
            placeholder="Algo que o casal precise lembrar"
            {...form.register("notes")}
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
