"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CATEGORY_ICONS } from "@/constants/categories";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import { CATEGORY_LABELS, RESPONSIBLE_LABELS } from "@/domain/value-objects/enums";
import { COMMITMENT_KIND_LABELS, DISPLAY_STATUS_LABELS } from "@/domain/value-objects/commitments";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { statusTone } from "@/features/finances/financial-status";
import { isLastInstallment, resolveDisplayStatus } from "@/domain/services/display-status";
import { installmentLabel } from "@/domain/services/installments";
import { useFinanceMutations } from "@/hooks/use-finances";
export function FinancialCard({ entry }: { entry: FinancialEntry }) {
  const Icon = CATEGORY_ICONS[entry.category];
  const positive = entry.type === "income";
  const display = resolveDisplayStatus(entry, new Date());
  const { pay } = useFinanceMutations();
  const canPay = display === "pending" || display === "overdue";

  return (
    <Link href={`/financas/${entry.id}`} className="block">
      <motion.article
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl border border-border/80 p-4 transition-transform active:scale-[0.99]"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-muted">
            <Icon className="size-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="truncate font-semibold">{entry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[entry.category]} · {RESPONSIBLE_LABELS[entry.responsible]}
                  {installmentLabel(entry) ? ` · ${installmentLabel(entry)}` : ""}
                </p>
              </div>
              <p className={`tabular text-sm font-semibold ${positive ? "text-success" : "text-foreground"}`}>
                {positive ? "+" : "-"} {formatCurrency(entry.amount)}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(display)}>{DISPLAY_STATUS_LABELS[display]}</Badge>
              <Badge>{COMMITMENT_KIND_LABELS[entry.commitmentKind]}</Badge>
              {isLastInstallment(entry) ? <Badge tone="primary">Última parcela 🎉</Badge> : null}
              <span className="text-xs text-muted-foreground">Vence {formatDate(entry.dueDate, "dd MMM")}</span>
            </div>
            {canPay ? (
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                loading={pay.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void pay.mutateAsync(entry.id);
                }}
              >
                Marcar como pago
              </Button>
            ) : null}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
