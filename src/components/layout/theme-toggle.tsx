"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon" : "md"}
      onClick={() => {
        if (!mounted) return;
        setTheme(isDark ? "light" : "dark");
      }}
      aria-label="Alternar tema"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {compact ? null : <span>{isDark ? "Claro" : "Escuro"}</span>}
    </Button>
  );
}
