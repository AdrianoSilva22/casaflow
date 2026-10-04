"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { loginRequest } from "@/lib/api";
import { DEMO_CREDENTIALS } from "@/constants/product";
import { loginSchema, type LoginFormValues } from "@/validators/financial-entry.schema";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: DEMO_CREDENTIALS.login, password: "" },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        try {
          await loginRequest(values.login, values.password);
          router.push("/dashboard");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Não foi possível entrar.");
        }
      })}
    >
      <div>
        <Label htmlFor="login">Usuário</Label>
        <Input
          id="login"
          autoComplete="username"
          placeholder="silva"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          {...form.register("login")}
          type="text"
        />
        <FieldError>{form.formState.errors.login?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Senha"
          {...form.register("password")}
        />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
        Entrar
      </Button>
    </form>
  );
}
