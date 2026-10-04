import type { Metadata } from "next";
import { FinanceEditor } from "@/features/finances/finance-editor";

export const metadata: Metadata = { title: "Editar finança" };

export default async function EditFinancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FinanceEditor id={id} />;
}
