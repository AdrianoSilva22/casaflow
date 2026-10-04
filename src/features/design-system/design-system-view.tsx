import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const colors = [
  ["Primary", "#7C3AED"],
  ["Secondary", "#06B6D4"],
  ["Success", "#22C55E"],
  ["Warning", "#F59E0B"],
  ["Danger", "#EF4444"],
  ["Dark", "#0F172A"],
];

export function DesignSystemView() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Design System" subtitle="Documentação visual inicial do CasaFlow" />
      <Card>
        <CardTitle>Princípios</CardTitle>
        <CardDescription className="mt-2">
          Mobile first, números em destaque, toque confortável, hierarquia clara e troca instantânea de tema.
        </CardDescription>
      </Card>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {colors.map(([name, hex]) => (
          <Card key={name}>
            <div className="mb-3 h-16 rounded-2xl" style={{ background: hex }} />
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{hex}</p>
          </Card>
        ))}
      </div>
      <Card className="space-y-4">
        <CardTitle>Componentes</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="primary">Receita</Badge>
          <Badge tone="success">Pago</Badge>
          <Badge tone="warning">Pendente</Badge>
          <Badge tone="danger">Atrasado</Badge>
        </div>
        <Input placeholder="Campo de exemplo" />
      </Card>
    </div>
  );
}
