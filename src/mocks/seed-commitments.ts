import { addMonths, format, parseISO } from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { InstallmentPlan } from "@/domain/entities/installment-plan";
import type { PaymentHistory } from "@/domain/entities/payment-history";
import type { RecurringExpense } from "@/domain/entities/recurring-expense";
import { buildPaymentHistory } from "@/domain/services/payments";
import { buildInstallmentEntries } from "@/domain/services/installments";
import { REFERENCE_DATE } from "@/constants/reference-date";
import type { Category, Responsible } from "@/domain/value-objects/enums";

const RECURRING_TEMPLATES: Array<{
  id: string;
  match: string;
  dueDay: number;
  amount: number;
  category: Category;
  responsible: Responsible;
  description: string;
}> = [
  { id: "rec_rent", match: "Aluguel do apartamento", dueDay: 10, amount: 2400, category: "housing", responsible: "both", description: "Contrato residencial" },
  { id: "rec_condo", match: "Condomínio", dueDay: 8, amount: 620, category: "housing", responsible: "both", description: "Taxa ordinária" },
  { id: "rec_water", match: "Conta de água", dueDay: 15, amount: 98, category: "water", responsible: "both", description: "Sabesp" },
  { id: "rec_energy", match: "Conta de energia", dueDay: 18, amount: 240, category: "energy", responsible: "both", description: "Enel" },
  { id: "rec_internet", match: "Internet fibra", dueDay: 7, amount: 129.9, category: "internet", responsible: "adriano", description: "Plano 500 mega" },
  { id: "rec_streaming", match: "Streaming da casa", dueDay: 6, amount: 89.9, category: "streaming", responsible: "both", description: "Netflix + Spotify Family" },
  { id: "rec_phone_adriano", match: "Celular Adriano", dueDay: 11, amount: 79.9, category: "phone", responsible: "adriano", description: "Plano controle" },
  { id: "rec_phone_adrielle", match: "Celular Adrielle", dueDay: 11, amount: 69.9, category: "phone", responsible: "adrielle", description: "Plano controle" },
  { id: "rec_health", match: "Plano de saúde", dueDay: 9, amount: 486.5, category: "health", responsible: "both", description: "Mensalidade do casal" },
  { id: "rec_english", match: "Curso de inglês Adrielle", dueDay: 14, amount: 197, category: "education", responsible: "adrielle", description: "Mensalidade online" },
  { id: "rec_invest", match: "Investimento mensal", dueDay: 28, amount: 800, category: "investments", responsible: "both", description: "Tesouro e fundos" },
  { id: "rec_reserve", match: "Reserva de emergência", dueDay: 28, amount: 350, category: "emergency_reserve", responsible: "both", description: "Caixinha automática" },
];

function stamp(plan: Omit<InstallmentPlan, "createdAt" | "updatedAt">): InstallmentPlan {
  const now = `${plan.firstDueDate}T12:00:00.000Z`;
  return { ...plan, createdAt: now, updatedAt: now };
}

export function enrichWithCommitments(baseEntries: FinancialEntry[], reference = REFERENCE_DATE) {
  const recurring: RecurringExpense[] = RECURRING_TEMPLATES.map((item) => ({
    id: item.id,
    name: item.match,
    description: item.description,
    amount: item.amount,
    dueDay: item.dueDay,
    category: item.category,
    responsible: item.responsible,
    status: "active",
    startedAt: "2024-10-01",
    endedAt: null,
    createdAt: "2024-10-01T12:00:00.000Z",
    updatedAt: "2024-10-01T12:00:00.000Z",
  }));

  const entries = baseEntries.map((entry) => {
    const template = RECURRING_TEMPLATES.find((item) => item.match === entry.name);
    if (!template) return entry;
    return {
      ...entry,
      commitmentKind: "recurring" as const,
      recurringExpenseId: template.id,
      notes: entry.notes || `Todo dia ${template.dueDay}`,
    };
  });

  const carEntries = entries
    .filter((entry) => entry.name === "Financiamento do carro")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const plans: InstallmentPlan[] = [];

  if (carEntries.length) {
    const carPlan = stamp({
      id: "plan_car",
      name: "Financiamento do carro",
      description: "Parcela CDC",
      totalAmount: 890 * 48,
      installmentCount: 48,
      installmentAmount: 890,
      firstDueDate: carEntries[0].dueDate,
      responsible: "adriano",
      category: "financing",
      status: "active",
    });
    plans.push(carPlan);
    carEntries.forEach((entry, index) => {
      const target = entries.find((item) => item.id === entry.id);
      if (!target) return;
      target.commitmentKind = "installment";
      target.installmentPlanId = carPlan.id;
      target.installmentNumber = index + 1;
      target.installmentCount = 48;
      target.description = `Parcela ${index + 1}/48`;
    });
  }

  const extraPlans = [
    stamp({
      id: "plan_notebook",
      name: "Notebook Dell",
      description: "Compra parcelada no cartão",
      totalAmount: 6000,
      installmentCount: 6,
      installmentAmount: 1000,
      firstDueDate: "2026-09-15",
      responsible: "adriano",
      category: "credit_card",
      status: "active",
    }),
    stamp({
      id: "plan_sofa",
      name: "Sofá da sala",
      description: "Mobília da casa",
      totalAmount: 4500,
      installmentCount: 10,
      installmentAmount: 450,
      firstDueDate: "2026-04-20",
      responsible: "both",
      category: "other",
      status: "active",
    }),
    stamp({
      id: "plan_iphone",
      name: "iPhone Adrielle",
      description: "Aparelho parcelado",
      totalAmount: 7200,
      installmentCount: 12,
      installmentAmount: 600,
      firstDueDate: "2026-01-10",
      responsible: "adrielle",
      category: "phone",
      status: "active",
    }),
    stamp({
      id: "plan_fridge",
      name: "Geladeira",
      description: "Última parcela em setembro",
      totalAmount: 3600,
      installmentCount: 12,
      installmentAmount: 300,
      firstDueDate: "2025-10-12",
      responsible: "both",
      category: "other",
      status: "active",
    }),
  ];

  plans.push(...extraPlans);

  for (const plan of extraPlans) {
    const generated = buildInstallmentEntries(plan, reference).map((draft, index) => {
      const due = addMonths(parseISO(`${plan.firstDueDate}T12:00:00`), index);
      return {
        ...draft,
        id: `ent_${plan.id}_${index + 1}`,
        createdAt: `${format(due, "yyyy-MM-dd")}T12:00:00.000Z`,
        updatedAt: `${format(due, "yyyy-MM-dd")}T12:00:00.000Z`,
      } satisfies FinancialEntry;
    });
    entries.push(...generated);
  }

  const history: PaymentHistory[] = entries
    .filter((entry) => entry.status === "paid" && entry.commitmentKind !== "once")
    .map((entry) => buildPaymentHistory(entry, entry.paymentDate ?? entry.dueDate));

  return { entries, recurring, plans, history };
}
