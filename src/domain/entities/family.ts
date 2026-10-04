import type { User } from "@/domain/entities/user";

export interface Family {
  id: string;
  name: string;
  members: User[];
  currency: "BRL";
  locale: "pt-BR";
}
