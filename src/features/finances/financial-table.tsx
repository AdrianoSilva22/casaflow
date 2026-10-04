import Link from "next/link";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import { CATEGORY_LABELS, ENTRY_STATUS_LABELS, RESPONSIBLE_LABELS } from "@/domain/value-objects/enums";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { statusTone } from "@/features/finances/financial-status";

export function FinancialTable({ items }: { items: FinancialEntry[] }) {
  return (
    <div className="hidden overflow-hidden rounded-3xl border border-border bg-card md:block">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Responsável</th>
            <th className="px-4 py-3 font-medium">Vencimento</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((entry) => (
            <tr key={entry.id} className="border-t border-border/70">
              <td className="px-4 py-3">
                <Link href={`/financas/${entry.id}`} className="font-medium hover:text-primary">
                  {entry.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{CATEGORY_LABELS[entry.category]}</td>
              <td className="px-4 py-3">{RESPONSIBLE_LABELS[entry.responsible]}</td>
              <td className="px-4 py-3">{formatDate(entry.dueDate, "dd/MM/yyyy")}</td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(entry.status)}>{ENTRY_STATUS_LABELS[entry.status]}</Badge>
              </td>
              <td className={`px-4 py-3 text-right tabular font-semibold ${entry.type === "income" ? "text-success" : ""}`}>
                {formatCurrency(entry.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
