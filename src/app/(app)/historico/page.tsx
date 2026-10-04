import type { Metadata } from "next";
import { HistoryView } from "@/features/commitments/history-view";

export const metadata: Metadata = { title: "Histórico" };

export default function HistoryPage() {
  return <HistoryView />;
}
