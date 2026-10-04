"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (incoming: Event) => {
      incoming.preventDefault();
      setEvent(incoming as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !event) return null;

  return (
    <Card className="fixed right-4 bottom-24 left-4 z-50 flex items-center justify-between gap-3 p-4 lg:right-8 lg:bottom-8 lg:left-auto lg:w-96">
      <div>
        <p className="text-sm font-semibold">Instalar o CasaFlow</p>
        <p className="text-xs text-muted-foreground">Acesse como um aplicativo, inclusive offline.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={async () => {
            await event.prompt();
            setVisible(false);
          }}
        >
          <Download className="size-4" />
          Instalar
        </Button>
        <Button size="icon" variant="ghost" className="size-9" onClick={() => setVisible(false)}>
          <X className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
