import type { Metadata } from "next";
import { MoreView } from "@/features/commitments/more-view";

export const metadata: Metadata = { title: "Mais" };

export default function MorePage() {
  return <MoreView />;
}
