import type { Metadata } from "next";
import { RecurringView } from "@/features/commitments/recurring-view";

export const metadata: Metadata = { title: "Recorrentes" };

export default function RecurringPage() {
  return <RecurringView />;
}
