"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurring, useRecurringMutation } from "@/hooks/use-finances";
import { formatCurrency } from "@/lib/format";
import { RECURRING_STATUS_LABELS, type RecurringStatus } from "@/domain/value-objects/commitments";
import { CATEGORY_LABELS, RESPONSIBLE_LABELS } from "@/domain/value-objects/enums";

export function RecurringView() {
  const { data, isLoading } = useRecurring();
  const update = useRecurringMutation();

  return (
    <div className="space-y-5">
      <DashboardHeader title="Contas recorrentes" subtitle="Cadastra uma vez. O mês seguinte nasce sozinho." />
      <Link href="/financas/nova" className="inline-flex h-11 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white">
        Nova recorrente
      </Link>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <Card key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.amount)} · Todo dia {item.dueDay}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[item.category]} · {RESPONSIBLE_LABELS[item.responsible]}
                  </p>
                </div>
                <Badge tone={item.status === "active" ? "success" : item.status === "inactive" ? "warning" : "neutral"}>
                  {RECURRING_STATUS_LABELS[item.status]}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["active", "inactive", "closed"] as RecurringStatus[]).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={item.status === status ? "soft" : "outline"}
                    loading={update.isPending}
                    onClick={() => update.mutate({ id: item.id, status })}
                  >
                    {RECURRING_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
