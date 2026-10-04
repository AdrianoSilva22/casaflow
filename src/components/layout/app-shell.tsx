import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNavigation } from "@/components/layout/mobile-bottom-navigation";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-grid min-h-dvh lg:flex">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col px-4 pt-2 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto w-full max-w-7xl flex-1">{children}</div>
      </div>
      <MobileBottomNavigation />
      <InstallPrompt />
    </div>
  );
}
