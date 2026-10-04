import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { InvalidCredentialsError, loginUseCase } from "@/application/use-cases/login";
import { adriano } from "@/mocks/family";

const passwordHash = bcrypt.hashSync("050721", 4);

const findUser = async (login: string) => {
  if (login !== "silva") return null;
  return { ...adriano, passwordHash, familyId: "family_casaflow" };
};

describe("loginUseCase", () => {
  it("autentica com usuário e senha simples", async () => {
    const session = await loginUseCase("silva", "050721", findUser);
    expect(session.sharedLogin).toBe(true);
    expect(session.user.name).toBe("Adriano");
  });

  it("rejeita credenciais inválidas", async () => {
    await expect(loginUseCase("outro", "123456", findUser)).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
