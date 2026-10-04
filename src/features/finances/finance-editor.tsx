"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FinancialForm } from "@/features/finances/financial-form";
import { useFinance, useFinanceMutations } from "@/hooks/use-finances";
import type { FinancialEntryFormValues } from "@/validators/financial-entry.schema";

export function FinanceEditor({ id }: { id?: string }) {
  const router = useRouter();
  const { data, isLoading } = useFinance(id);
  const { create, update, remove, pay } = useFinanceMutations();
  const editing = Boolean(id);

  async function handleSubmit(values: FinancialEntryFormValues) {
    if (editing && id) {
      await update.mutateAsync({
        id,
        input: {
          name: values.name,
          description: values.description ?? "",
          amount: values.amount,
          category: values.category,
          dueDate: values.dueDate || data?.dueDate || "",
          paymentDate: values.paymentDate || null,
          responsible: values.responsible,
          type: values.type,
          status: values.status,
          notes: values.notes ?? "",
        },
      });
    } else {
      await create.mutateAsync(values);
    }
    router.push(values.commitmentKind === "installment" ? "/parcelamentos" : values.commitmentKind === "recurring" ? "/recorrentes" : "/financas");
  }

  return (
    <div className="space-y-5">
      <DashboardHeader
        title={editing ? "Editar finança" : "Nova finança"}
        subtitle="Cadastro rápido, pensado para o celular"
      />
      <Card>
        {editing && isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando lançamento...</p>
        ) : (
          <FinancialForm
            initial={data}
            submitLabel={editing ? "Salvar alterações" : "Adicionar lançamento"}
            submitting={create.isPending || update.isPending}
            onSubmit={handleSubmit}
          />
        )}
      </Card>
      {editing && id && data && data.status !== "paid" ? (
        <Button
          variant="secondary"
          className="w-full md:w-auto"
          loading={pay.isPending}
          onClick={async () => {
            await pay.mutateAsync(id);
            router.refresh();
          }}
        >
          Marcar como pago
        </Button>
      ) : null}
      {editing && id ? (
        <Button
          variant="danger"
          className="w-full md:w-auto"
          loading={remove.isPending}
          onClick={async () => {
            await remove.mutateAsync(id);
            router.push("/financas");
          }}
        >
          Excluir lançamento
        </Button>
      ) : null}
    </div>
  );
}
