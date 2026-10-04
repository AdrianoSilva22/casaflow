import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants/product";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="app-grid min-h-dvh px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-6 flex justify-end">
          <ThemeToggle compact />
        </div>
        <section className="glass-card rounded-[2rem] border border-border p-6">
          <div className="mb-8">
            <span className="grid size-14 place-items-center rounded-3xl bg-primary text-2xl font-bold text-white">C</span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">{PRODUCT_NAME}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{PRODUCT_TAGLINE}</p>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
