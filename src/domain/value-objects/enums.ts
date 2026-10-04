export const ENTRY_TYPES = ["income", "expense"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export const ENTRY_STATUSES = ["pending", "paid", "overdue", "cancelled"] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const RESPONSIBLES = ["adriano", "adrielle", "both"] as const;
export type Responsible = (typeof RESPONSIBLES)[number];

export const CATEGORIES = [
  "housing",
  "grocery",
  "water",
  "energy",
  "internet",
  "streaming",
  "phone",
  "health",
  "pharmacy",
  "education",
  "credit_card",
  "financing",
  "transport",
  "fuel",
  "leisure",
  "restaurant",
  "travel",
  "investments",
  "emergency_reserve",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  income: "Receita",
  expense: "Despesa",
};

export const ENTRY_STATUS_LABELS: Record<EntryStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

export const RESPONSIBLE_LABELS: Record<Responsible, string> = {
  adriano: "Adriano",
  adrielle: "Adrielle",
  both: "Ambos",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  housing: "Moradia",
  grocery: "Mercado",
  water: "Água",
  energy: "Energia",
  internet: "Internet",
  streaming: "Streaming",
  phone: "Telefone",
  health: "Saúde",
  pharmacy: "Farmácia",
  education: "Educação",
  credit_card: "Cartão de Crédito",
  financing: "Financiamento",
  transport: "Transporte",
  fuel: "Combustível",
  leisure: "Lazer",
  restaurant: "Restaurante",
  travel: "Viagem",
  investments: "Investimentos",
  emergency_reserve: "Reserva de Emergência",
  other: "Outros",
};
