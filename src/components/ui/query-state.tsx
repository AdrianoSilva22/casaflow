import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function QueryState({
  isLoading,
  isError,
  onRetry,
  loading,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  loading: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) return loading;

  if (isError) {
    return (
      <div className="rounded-[1.5rem] border border-border bg-card p-6">
        <p className="font-medium">Não foi possível carregar os dados.</p>
        <p className="mt-1 text-sm text-muted-foreground">O banco pode ter falhado. Tente de novo em instantes.</p>
        {onRetry ? (
          <Button className="mt-4" variant="outline" onClick={onRetry}>
            Tentar de novo
          </Button>
        ) : null}
      </div>
    );
  }

  return children;
}
