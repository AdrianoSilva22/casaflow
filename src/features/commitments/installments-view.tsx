"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstallments } from "@/hooks/use-finances";
import { formatCurrency } from "@/lib/format";
import { PLAN_STATUS_LABELS } from "@/domain/value-objects/commitments";
import { RESPONSIBLE_LABELS } from "@/domain/value-objects/enums";

export function InstallmentsView() {
  const { data, isLoading } = useInstallments();

  return (
    <div className="space-y-5">
      <DashboardHeader title="Parcelamentos" subtitle="O sistema controla cada parcela. Você só cadastra uma vez." />
      <Link href="/financas/nova" className="inline-flex h-11 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white">
        Novo parcelamento
      </Link>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data.map((plan) => (
            <Card key={plan.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.installmentCount} parcelas · {RESPONSIBLE_LABELS[plan.responsible]}
                  </p>
                </div>
                <Badge tone={plan.status === "closed" ? "success" : "primary"}>
                  {plan.status === "closed" ? "Parcelamento Encerrado" : PLAN_STATUS_LABELS[plan.status]}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Metric label="Valor total" value={formatCurrency(plan.totalAmount)} />
                <Metric label="Parcela atual" value={`${plan.currentNumber}/${plan.installmentCount}`} />
                <Metric label="Faltam" value={`${plan.remainingCount} parcelas`} />
                <Metric label="Valor parcela" value={formatCurrency(plan.installmentAmount)} />
              </div>
              {plan.currentNumber === plan.installmentCount && plan.status === "active" ? (
                <p className="mt-3 text-sm font-medium text-primary">Última parcela 🎉</p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular">{value}</p>
    </div>
  );
}
