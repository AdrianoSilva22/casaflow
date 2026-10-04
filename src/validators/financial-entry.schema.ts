import { z } from "zod";
import {
  CATEGORIES,
  ENTRY_STATUSES,
  ENTRY_TYPES,
  RESPONSIBLES,
} from "@/domain/value-objects/enums";
import { COMMITMENT_KINDS, RECURRING_STATUSES } from "@/domain/value-objects/commitments";

export const financialEntrySchema = z
  .object({
    name: z.string().min(2, "Informe um nome").max(80, "Nome muito longo"),
    description: z.string().max(180, "Descrição muito longa").optional().or(z.literal("")),
    amount: z.coerce.number().min(0, "Informe um valor"),
    category: z.enum(CATEGORIES),
    dueDate: z.string().optional().or(z.literal("")),
    paymentDate: z.string().optional().or(z.literal("")),
    responsible: z.enum(RESPONSIBLES),
    type: z.enum(ENTRY_TYPES),
    status: z.enum(ENTRY_STATUSES),
    notes: z.string().max(280, "Observação muito longa").optional().or(z.literal("")),
    commitmentKind: z.enum(COMMITMENT_KINDS),
    dueDay: z.coerce.number().optional().nullable(),
    installmentCount: z.coerce.number().optional().nullable(),
    totalAmount: z.coerce.number().min(0).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.commitmentKind === "once") {
      if (!value.dueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dueDate"],
          message: "Informe a data de vencimento",
        });
      }
      if (value.amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Informe um valor maior que zero",
        });
      }
    }
    if (value.commitmentKind === "recurring") {
      if (!value.dueDay || value.dueDay < 1 || value.dueDay > 31) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dueDay"],
          message: "Informe o dia de vencimento (1 a 31)",
        });
      }
      if (value.amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Informe um valor maior que zero",
        });
      }
    }
    if (value.commitmentKind === "installment") {
      if (!value.dueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dueDate"],
          message: "Informe a data do primeiro vencimento",
        });
      }
      if (!value.installmentCount || value.installmentCount < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["installmentCount"],
          message: "Informe a quantidade de parcelas (mínimo 2)",
        });
      }
      if ((!value.totalAmount || value.totalAmount <= 0) && (!value.amount || value.amount <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["totalAmount"],
          message: "Informe o valor total do parcelamento",
        });
      }
    }
  });

export type FinancialEntryFormValues = z.infer<typeof financialEntrySchema>;

export const financialEntryUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(180).optional(),
  amount: z.coerce.number().positive().optional(),
  category: z.enum(CATEGORIES).optional(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional().or(z.literal("")),
  responsible: z.enum(RESPONSIBLES).optional(),
  type: z.enum(ENTRY_TYPES).optional(),
  status: z.enum(ENTRY_STATUSES).optional(),
  notes: z.string().max(280).optional(),
});

export const loginSchema = z.object({
  login: z.string().min(2, "Informe o usuário").max(40),
  password: z.string().min(4, "Informe a senha"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const recurringStatusSchema = z.object({
  status: z.enum(RECURRING_STATUSES),
});
