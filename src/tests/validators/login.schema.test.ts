import { describe, expect, it } from "vitest";
import { financialEntrySchema, loginSchema } from "@/validators/financial-entry.schema";

describe("schemas", () => {
  it("valida login simples", () => {
    expect(loginSchema.safeParse({ login: "silva", password: "050721" }).success).toBe(true);
    expect(loginSchema.safeParse({ login: "a", password: "1" }).success).toBe(false);
  });

  it("exige valor positivo no lançamento", () => {
    const result = financialEntrySchema.safeParse({
      name: "Mercado",
      amount: 0,
      category: "grocery",
      dueDate: "2026-09-12",
      responsible: "both",
      type: "expense",
      status: "pending",
      commitmentKind: "once",
    });
    expect(result.success).toBe(false);
  });
});
