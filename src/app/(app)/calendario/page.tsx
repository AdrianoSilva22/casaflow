import type { Metadata } from "next";
import { CalendarPageView } from "@/features/calendar/calendar-page";

export const metadata: Metadata = { title: "Calendário" };

export default function CalendarPage() {
  return <CalendarPageView />;
}
