"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentHistory } from "@/hooks/use-finances";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import { COMMITMENT_KIND_LABELS } from "@/domain/value-objects/commitments";

import { AVAILABLE_MONTHS } from "@/constants/months";

export function HistoryView() {
  const [month, setMonth] = useState("");
  const { data, isLoading } = usePaymentHistory(month || undefined);

  return (
    <div className="space-y-5">
      <DashboardHeader
        title="Histórico de pagamentos"
        subtitle="Tudo o que já foi baixado, mês a mês."
      />
      <Select value={month} onChange={(event) => setMonth(event.target.value)}>
        <option value="">Todos os meses</option>
        {AVAILABLE_MONTHS.map((item) => (
          <option key={item} value={item}>
            {formatMonthYear(`${item}-01`)}
          </option>
        ))}
      </Select>
      {isLoading || !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data.slice(0, 80).map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.paidAt, "dd MMM yyyy")}
                  {item.installmentLabel ? ` · Parcela ${item.installmentLabel}` : ""}
                </p>
              </div>
              <div className="text-right">
                <Badge tone="success">Pago</Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {COMMITMENT_KIND_LABELS[item.kind]}
                </p>
                <p className="tabular text-sm font-semibold">{formatCurrency(item.amount)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
