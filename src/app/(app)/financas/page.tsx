import type { Metadata } from "next";
import { FinancesView } from "@/features/finances/finances-view";

export const metadata: Metadata = { title: "Finanças" };

export default function FinancesPage() {
  return <FinancesView />;
}
