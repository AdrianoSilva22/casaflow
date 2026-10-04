import bcrypt from "bcryptjs";
import type { AuthSession, User } from "@/domain/entities/user";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Usuário ou senha inválidos.");
    this.name = "InvalidCredentialsError";
  }
}

export interface AuthUserRecord extends User {
  passwordHash: string;
  familyId: string;
}

export async function loginUseCase(
  login: string,
  password: string,
  findUser: (login: string) => Promise<AuthUserRecord | null>,
): Promise<AuthSession> {
  const user = await findUser(login.trim().toLowerCase());
  if (!user) throw new InvalidCredentialsError();

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new InvalidCredentialsError();

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarInitials: user.avatarInitials,
      color: user.color,
    },
    familyId: user.familyId,
    sharedLogin: true,
  };
}
