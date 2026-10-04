import Link from "next/link";
import { PRODUCT_NAME } from "@/constants/product";

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold text-primary">{PRODUCT_NAME}</p>
        <h1 className="mt-3 text-3xl font-semibold">Você está offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">O app usa cache inteligente. Tente abrir o dashboard novamente.</p>
        <Link href="/dashboard" className="mt-6 inline-flex h-12 items-center rounded-2xl bg-primary px-5 font-semibold text-white">
          Tentar de novo
        </Link>
      </div>
    </main>
  );
}
