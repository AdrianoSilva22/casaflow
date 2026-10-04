import type { Metadata } from "next";
import { MonthSummaryView } from "@/features/commitments/month-summary-view";

export const metadata: Metadata = { title: "Resumo do mês" };

export default function SummaryPage() {
  return <MonthSummaryView />;
}
