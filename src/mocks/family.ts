import type { Family } from "@/domain/entities/family";
import type { User } from "@/domain/entities/user";

export const adriano: User = {
  id: "user_adriano",
  name: "Adriano",
  email: "adriano@email.com",
  role: "owner",
  avatarInitials: "AD",
  color: "#7C3AED",
};

export const adrielle: User = {
  id: "user_adrielle",
  name: "Adrielle",
  email: "adrielle@email.com",
  role: "member",
  avatarInitials: "AR",
  color: "#06B6D4",
};

export const mockFamily: Family = {
  id: "family_casaflow",
  name: "Casa Adriano & Adrielle",
  members: [adriano, adrielle],
  currency: "BRL",
  locale: "pt-BR",
};
