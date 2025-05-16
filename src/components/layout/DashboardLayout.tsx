
import { ReactNode } from "react";
import { SidebarMenu } from "@/components/SidebarMenu";
import { MobileMenu } from "@/components/MobileMenu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background">
      <SidebarMenu />
      <main className={cn("flex-1 overflow-auto", isMobile ? "w-full px-2 py-4" : "ml-[70px] p-6 lg:ml-64", className)}>
        {isMobile && (
          <div className="mb-4 flex items-center">
            <MobileMenu />
            <h1 className="text-xl font-bold ml-4">Gestão de Clientes</h1>
          </div>
        )}
        <div className={cn("mx-auto", isMobile ? "w-full" : "container")}>{children}</div>
      </main>
    </div>
  );
}
