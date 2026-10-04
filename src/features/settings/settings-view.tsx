"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/skeleton";
import { logoutRequest } from "@/lib/api";

export function SettingsView() {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <DashboardHeader title="Configurações" subtitle="Preferências locais da Fase 1" />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>A troca é instantânea e fica salva neste aparelho.</CardDescription>
          </div>
          <ThemeToggle />
        </CardHeader>
      </Card>
      <Card className="space-y-4">
        <div>
          <CardTitle>Notificações futuras</CardTitle>
          <CardDescription>Planejado: push, e-mail, WhatsApp e alertas de vencimento.</CardDescription>
        </div>
        <Switch checked={false} onChange={() => undefined} label="Push notification (em breve)" />
        <Switch checked={false} onChange={() => undefined} label="E-mail (em breve)" />
        <Switch checked={false} onChange={() => undefined} label="WhatsApp (em breve)" />
      </Card>
      <Card>
        <CardTitle>Conta compartilhada</CardTitle>
        <CardDescription className="mt-1">
          Nesta fase existe um único login do casal. A arquitetura já prevê usuários, famílias e grupos.
        </CardDescription>
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            await logoutRequest();
            router.push("/login");
            router.refresh();
          }}
        >
          Sair
        </Button>
      </Card>
    </div>
  );
}
