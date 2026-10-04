import { CalendarDays, History, Home, Layers, PieChart, Repeat, Settings, UserRound, Wallet } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/financas", label: "Finanças", icon: Wallet },
  { href: "/calendario", label: "Agenda", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: PieChart },
] as const;

export const COMMITMENT_ITEMS = [
  { href: "/parcelamentos", label: "Parcelamentos", icon: Layers },
  { href: "/recorrentes", label: "Recorrentes", icon: Repeat },
  { href: "/resumo", label: "Resumo do mês", icon: Wallet },
  { href: "/historico", label: "Histórico", icon: History },
] as const;

export const MORE_ITEMS = [
  { href: "/perfil", label: "Perfil do casal", icon: UserRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/design-system", label: "Design System", icon: PieChart },
] as const;
