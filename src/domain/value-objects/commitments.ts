export const COMMITMENT_KINDS = ["once", "recurring", "installment"] as const;
export type CommitmentKind = (typeof COMMITMENT_KINDS)[number];

export const COMMITMENT_KIND_LABELS: Record<CommitmentKind, string> = {
  once: "Despesa única",
  recurring: "Recorrente",
  installment: "Parcelamento",
};

export const RECURRING_STATUSES = ["active", "inactive", "closed"] as const;
export type RecurringStatus = (typeof RECURRING_STATUSES)[number];

export const RECURRING_STATUS_LABELS: Record<RecurringStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
  closed: "Encerrada",
};

export const PLAN_STATUSES = ["active", "closed"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  active: "Ativo",
  closed: "Encerrado",
};

export const DISPLAY_STATUSES = ["pending", "paid", "overdue", "future", "cancelled"] as const;
export type DisplayStatus = (typeof DISPLAY_STATUSES)[number];

export const DISPLAY_STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
  future: "Futuro",
  cancelled: "Cancelado",
};
