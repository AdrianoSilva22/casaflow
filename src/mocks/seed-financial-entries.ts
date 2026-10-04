import { addMonths, format } from "date-fns";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import type { Category, EntryStatus, EntryType, Responsible } from "@/domain/value-objects/enums";

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function money(random: () => number, min: number, max: number) {
  return Math.round((min + (max - min) * random()) * 100) / 100;
}

function iso(year: number, month: number, day: number) {
  return format(new Date(year, month, day, 12, 0, 0), "yyyy-MM-dd");
}

let counter = 0;
function id() {
  counter += 1;
  return `ent_${String(counter).padStart(4, "0")}`;
}

function entry(partial: Omit<FinancialEntry, "id" | "createdAt" | "updatedAt" | "commitmentKind" | "recurringExpenseId" | "installmentPlanId" | "installmentNumber" | "installmentCount"> & Partial<Pick<FinancialEntry, "commitmentKind" | "recurringExpenseId" | "installmentPlanId" | "installmentNumber" | "installmentCount">>): FinancialEntry {
  const now = `${partial.dueDate}T12:00:00.000Z`;
  return {
    id: id(),
    createdAt: now,
    updatedAt: now,
    commitmentKind: "once",
    recurringExpenseId: null,
    installmentPlanId: null,
    installmentNumber: null,
    installmentCount: null,
    ...partial,
  };
}

function paidOn(dueDate: string, delayDays = 0) {
  const date = new Date(`${dueDate}T12:00:00`);
  date.setDate(date.getDate() + delayDays);
  return format(date, "yyyy-MM-dd");
}

export function generateFinancialEntries(reference = new Date("2026-09-10")): FinancialEntry[] {
  counter = 0;
  const random = mulberry32(20260910);
  const entries: FinancialEntry[] = [];
  const start = new Date(2024, 9, 1);
  const months = 24;

  for (let i = 0; i < months; i += 1) {
    const cursor = addMonths(start, i);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const isCurrent = year === reference.getFullYear() && month === reference.getMonth();
    const isFutureDay = (day: number) =>
      isCurrent && new Date(year, month, day) > reference;

    const bias = year === 2026 && month === 2 ? 1.35 : year === 2026 && month === 6 ? 0.72 : 1;
    const grocery = money(random, 1180, 1680) * bias;
    const energy = money(random, 170, month >= 11 || month <= 2 ? 380 : 260);
    const water = money(random, 72, 128);
    const restaurant = money(random, 180, 620) * bias;
    const leisure = money(random, 80, 420) * bias;
    const fuel = money(random, 380, 690);
    const pharmacy = money(random, 35, 210);
    const creditCard = money(random, 920, 2480) * bias;
    const marketExtra = money(random, 90, 280);

    const mark = (day: number, fallback: EntryStatus = "paid"): EntryStatus => {
      if (!isCurrent) return fallback;
      if (isFutureDay(day)) return "pending";
      if (day < 8 && fallback !== "paid") return "overdue";
      return fallback;
    };

    const salaryStatus = isCurrent ? "paid" : "paid";

    entries.push(
      entry({
        name: "Salário Adriano",
        description: "Pagamento mensal CLT",
        amount: 9800,
        dueDate: iso(year, month, 5),
        paymentDate: paidOn(iso(year, month, 5)),
        type: "income",
        status: salaryStatus,
        responsible: "adriano",
        category: "other",
        notes: "Crédito em conta Itaú",
      }),
      entry({
        name: "Salário Adrielle",
        description: "Pagamento mensal CLT",
        amount: 7200,
        dueDate: iso(year, month, 5),
        paymentDate: paidOn(iso(year, month, 5)),
        type: "income",
        status: salaryStatus,
        responsible: "adrielle",
        category: "other",
        notes: "Crédito em conta Nubank",
      }),
      entry({
        name: "Aluguel do apartamento",
        description: "Contrato residencial",
        amount: 2400,
        dueDate: iso(year, month, 10),
        paymentDate: isCurrent && reference.getDate() < 10 ? null : paidOn(iso(year, month, 10), -1),
        type: "expense",
        status: isCurrent && reference.getDate() < 10 ? "pending" : "paid",
        responsible: "both",
        category: "housing",
        notes: "PIX para imobiliária",
      }),
      entry({
        name: "Condomínio",
        description: "Taxa ordinária",
        amount: 620,
        dueDate: iso(year, month, 8),
        paymentDate: isCurrent && reference.getDate() < 8 ? null : paidOn(iso(year, month, 8)),
        type: "expense",
        status: mark(8, "paid"),
        responsible: "both",
        category: "housing",
        notes: "",
      }),
      entry({
        name: "Mercado do mês",
        description: "Compras principais no Atacadão e Carrefour",
        amount: Math.round(grocery * 100) / 100,
        dueDate: iso(year, month, 12),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 12)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adrielle",
        category: "grocery",
        notes: "Inclui higiene e limpeza",
      }),
      entry({
        name: "Feira e hortifruti",
        description: "Compras da semana",
        amount: Math.round(marketExtra * 100) / 100,
        dueDate: iso(year, month, 20),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 20)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adriano",
        category: "grocery",
        notes: "",
      }),
      entry({
        name: "Conta de água",
        description: "Sabesp",
        amount: Math.round(water * 100) / 100,
        dueDate: iso(year, month, 15),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 15)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "both",
        category: "water",
        notes: "",
      }),
      entry({
        name: "Conta de energia",
        description: "Enel",
        amount: Math.round(energy * 100) / 100,
        dueDate: iso(year, month, 18),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 18)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "both",
        category: "energy",
        notes: month <= 2 ? "Verão, ar-condicionado" : "",
      }),
      entry({
        name: "Internet fibra",
        description: "Plano 500 mega",
        amount: 129.9,
        dueDate: iso(year, month, 7),
        paymentDate: isCurrent && reference.getDate() < 7 ? null : paidOn(iso(year, month, 7)),
        type: "expense",
        status: isCurrent && reference.getDate() < 7 ? "overdue" : "paid",
        responsible: "adriano",
        category: "internet",
        notes: "Débito automático",
      }),
      entry({
        name: "Streaming da casa",
        description: "Netflix + Spotify Family",
        amount: 89.9,
        dueDate: iso(year, month, 6),
        paymentDate: isCurrent && reference.getDate() < 6 ? null : paidOn(iso(year, month, 6)),
        type: "expense",
        status: isCurrent && reference.getDate() < 6 ? "overdue" : "paid",
        responsible: "both",
        category: "streaming",
        notes: "",
      }),
      entry({
        name: "Celular Adriano",
        description: "Plano controle",
        amount: 79.9,
        dueDate: iso(year, month, 11),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 11)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adriano",
        category: "phone",
        notes: "",
      }),
      entry({
        name: "Celular Adrielle",
        description: "Plano controle",
        amount: 69.9,
        dueDate: iso(year, month, 11),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 11)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adrielle",
        category: "phone",
        notes: "",
      }),
      entry({
        name: "Plano de saúde",
        description: "Mensalidade do casal",
        amount: 486.5,
        dueDate: iso(year, month, 9),
        paymentDate: isCurrent && reference.getDate() < 9 ? null : paidOn(iso(year, month, 9)),
        type: "expense",
        status: isCurrent && reference.getDate() < 9 ? "overdue" : "paid",
        responsible: "both",
        category: "health",
        notes: "",
      }),
      entry({
        name: "Farmácia",
        description: "Medicamentos e vitaminas",
        amount: Math.round(pharmacy * 100) / 100,
        dueDate: iso(year, month, 22),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 22)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adrielle",
        category: "pharmacy",
        notes: "",
      }),
      entry({
        name: "Curso de inglês Adrielle",
        description: "Mensalidade online",
        amount: 197,
        dueDate: iso(year, month, 14),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 14)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adrielle",
        category: "education",
        notes: "",
      }),
      entry({
        name: "Fatura do cartão",
        description: "Nubank conjunto",
        amount: Math.round(creditCard * 100) / 100,
        dueDate: iso(year, month, 16),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 16)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "both",
        category: "credit_card",
        notes: "Fecha dia 8",
      }),
      entry({
        name: "Financiamento do carro",
        description: "Parcela CDC",
        amount: 890,
        dueDate: iso(year, month, 13),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 13)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adriano",
        category: "financing",
        notes: "48x",
      }),
      entry({
        name: "Combustível",
        description: "Abastecimentos do mês",
        amount: Math.round(fuel * 100) / 100,
        dueDate: iso(year, month, 21),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 21)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "adriano",
        category: "fuel",
        notes: "",
      }),
      entry({
        name: "Jantar e delivery",
        description: "iFood e restaurantes",
        amount: Math.round(restaurant * 100) / 100,
        dueDate: iso(year, month, 25),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 25)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "both",
        category: "restaurant",
        notes: "",
      }),
      entry({
        name: "Lazer do casal",
        description: "Cinema, academia e passeios",
        amount: Math.round(leisure * 100) / 100,
        dueDate: iso(year, month, 27),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 27)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "both",
        category: "leisure",
        notes: "",
      }),
      entry({
        name: "Investimento mensal",
        description: "Tesouro e fundos",
        amount: month % 3 === 0 ? 1200 : 800,
        dueDate: iso(year, month, 28),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 28)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "both",
        category: "investments",
        notes: "Meta 15% da renda",
      }),
      entry({
        name: "Reserva de emergência",
        description: "Caixinha automática",
        amount: 350,
        dueDate: iso(year, month, 28),
        paymentDate: isCurrent ? null : paidOn(iso(year, month, 28)),
        type: "expense",
        status: isCurrent ? "pending" : "paid",
        responsible: "both",
        category: "emergency_reserve",
        notes: "",
      }),
    );

    if (month === 11) {
      entries.push(
        entry({
          name: "13º salário Adriano",
          description: "Parcela única",
          amount: 9800,
          dueDate: iso(year, month, 19),
          paymentDate: paidOn(iso(year, month, 19)),
          type: "income",
          status: "paid",
          responsible: "adriano",
          category: "other",
          notes: "",
        }),
        entry({
          name: "13º salário Adrielle",
          description: "Parcela única",
          amount: 7200,
          dueDate: iso(year, month, 19),
          paymentDate: paidOn(iso(year, month, 19)),
          type: "income",
          status: "paid",
          responsible: "adrielle",
          category: "other",
          notes: "",
        }),
        entry({
          name: "Presentes de Natal",
          description: "Família e amigos",
          amount: money(random, 680, 1240),
          dueDate: iso(year, month, 20),
          paymentDate: paidOn(iso(year, month, 20)),
          type: "expense",
          status: "paid",
          responsible: "both",
          category: "leisure",
          notes: "",
        }),
      );
    }

    if (month === 2 && year === 2026) {
      entries.push(
        entry({
          name: "Viagem para Gramado",
          description: "Hospedagem, pedágio e passeios",
          amount: 2870,
          dueDate: iso(year, month, 4),
          paymentDate: paidOn(iso(year, month, 4)),
          type: "expense",
          status: "paid",
          responsible: "both",
          category: "travel",
          notes: "Aniversário de namoro",
        }),
      );
    }

    if (month === 6 && year === 2026) {
      entries.push(
        entry({
          name: "Freelance Adriano",
          description: "Consultoria de weekend",
          amount: 1800,
          dueDate: iso(year, month, 23),
          paymentDate: paidOn(iso(year, month, 23)),
          type: "income",
          status: "paid",
          responsible: "adriano",
          category: "other",
          notes: "",
        }),
      );
    }

    if (i % 5 === 0) {
      entries.push(
        entry({
          name: "Uber e transporte",
          description: "Deslocamentos extras",
          amount: money(random, 60, 180),
          dueDate: iso(year, month, 17),
          paymentDate: isCurrent ? null : paidOn(iso(year, month, 17)),
          type: "expense",
          status: isCurrent ? "pending" : "paid",
          responsible: "adrielle",
          category: "transport",
          notes: "",
        }),
      );
    }
  }

  entries.push(
    entry({
      name: "Seguro do carro",
      description: "Parcela mensal em atraso",
      amount: 187.4,
      dueDate: "2026-09-03",
      paymentDate: null,
      type: "expense",
      status: "overdue",
      responsible: "adriano",
      category: "financing",
      notes: "Aviso da seguradora",
    }),
    entry({
      name: "Consulta oftalmológica",
      description: "Retorno Adrielle",
      amount: 280,
      dueDate: "2026-09-04",
      paymentDate: null,
      type: "expense",
      status: "overdue",
      responsible: "adrielle",
      category: "health",
      notes: "Reagendar se necessário",
    }),
    entry({
      name: "Supermercado extra",
      description: "Compras da semana",
      amount: 214.5,
      dueDate: "2026-09-12",
      paymentDate: null,
      type: "expense",
      status: "pending",
      responsible: "adriano",
      category: "grocery",
      notes: "",
    }),
    entry({
      name: "Assinatura Coursera",
      description: "Curso de dados",
      amount: 159,
      dueDate: "2026-09-14",
      paymentDate: null,
      type: "expense",
      status: "pending",
      responsible: "adriano",
      category: "education",
      notes: "",
    }),
  );

  return entries;
}

export const mockFinancialEntries = generateFinancialEntries();

export type SeedCategory = Category;
export type SeedStatus = EntryStatus;
export type SeedType = EntryType;
export type SeedResponsible = Responsible;
