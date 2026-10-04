import { DEMO_CREDENTIALS } from "@/constants/product";
import { adriano } from "@/mocks/family";
import type { AuthUserRecord } from "@/application/use-cases/login";

const SILVA_PASSWORD_HASH = "$2b$10$hE4H8bTlqAw9EH2Rb2K4mOeD16OotGWB3Jl4QQW2j1Fd9e4pEsPXK";

export function findLocalUserByLogin(login: string): AuthUserRecord | null {
  if (login.trim().toLowerCase() !== DEMO_CREDENTIALS.login) return null;

  return {
    ...adriano,
    passwordHash: SILVA_PASSWORD_HASH,
    familyId: "family_casaflow",
  };
}
