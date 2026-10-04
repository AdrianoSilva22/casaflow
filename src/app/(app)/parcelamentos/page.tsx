import type { Metadata } from "next";
import { InstallmentsView } from "@/features/commitments/installments-view";

export const metadata: Metadata = { title: "Parcelamentos" };

export default function InstallmentsPage() {
  return <InstallmentsView />;
}
