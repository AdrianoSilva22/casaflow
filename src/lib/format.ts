import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LOCALE } from "@/constants/product";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "BRL",
    notation: Math.abs(value) >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function formatCurrencyInput(value: number) {
  return formatCurrency(value || 0);
}

export function toDate(value: string | Date) {
  if (value instanceof Date) return value;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : new Date(value);
}

export function formatDate(value: string | Date, pattern = "dd MMM yyyy") {
  return format(toDate(value), pattern, { locale: ptBR });
}

export function formatMonthYear(value: string | Date) {
  const label = format(toDate(value), "MMMM yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShortMonth(value: string | Date) {
  const label = format(toDate(value), "MMM", { locale: ptBR });
  return label.replace(".", "");
}

export function monthKey(value: string | Date) {
  return format(toDate(value), "yyyy-MM");
}
