import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { mockFamily } from "@/mocks/family";

export function ProfileView() {
  return (
    <div className="space-y-5">
      <DashboardHeader title="Perfil do casal" subtitle={mockFamily.name} />
      <Card className="overflow-hidden p-0">
        <div className="h-28 bg-linear-to-r from-primary to-secondary" />
        <div className="-mt-8 px-5 pb-5">
          <div className="flex -space-x-3">
            {mockFamily.members.map((member) => (
              <Avatar key={member.id} initials={member.avatarInitials} color={member.color} size="lg" />
            ))}
          </div>
          <CardTitle className="mt-4">Adriano & Adrielle</CardTitle>
          <CardDescription>Família única, login compartilhado, pronta para evoluir para múltiplos usuários.</CardDescription>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {mockFamily.members.map((member) => (
          <Card key={member.id} className="flex items-center gap-4">
            <Avatar initials={member.avatarInitials} color={member.color} />
            <div>
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{member.role === "owner" ? "Titular" : "Membro"}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
