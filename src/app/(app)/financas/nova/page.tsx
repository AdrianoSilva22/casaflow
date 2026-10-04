import type { Metadata } from "next";
import { FinanceEditor } from "@/features/finances/finance-editor";

export const metadata: Metadata = { title: "Nova finança" };

export default function NewFinancePage() {
  return <FinanceEditor />;
}
