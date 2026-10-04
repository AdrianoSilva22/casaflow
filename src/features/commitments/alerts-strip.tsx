import Link from "next/link";
import type { CommitmentAlert } from "@/domain/services/commitments";
import { formatCurrency, formatDate } from "@/lib/format";

const tones = {
  overdue: "border-danger/30 bg-danger/10",
  today: "border-warning/30 bg-warning/10",
  tomorrow: "border-warning/30 bg-warning/10",
  week: "border-primary/20 bg-primary/8",
  last: "border-secondary/30 bg-secondary/10",
};

export function AlertsStrip({ alerts }: { alerts: CommitmentAlert[] }) {
  if (!alerts.length) return null;

  return (
    <section className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
      {alerts.map((alert) => (
        <Link key={alert.id} href={`/financas/${alert.id}`} className={`min-w-[220px] rounded-3xl border p-4 ${tones[alert.kind]}`}>
          <p className="text-xs font-semibold uppercase tracking-wide">{alert.title}</p>
          <p className="mt-2 font-semibold">{alert.subtitle}</p>
          <p className="mt-1 text-sm tabular">{formatCurrency(alert.amount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(alert.dueDate, "dd MMM")}</p>
        </Link>
      ))}
    </section>
  );
}
