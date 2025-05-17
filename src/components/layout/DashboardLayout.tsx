
import { ReactNode, useEffect, useState } from "react";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse state changes
  const handleSidebarStateChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarMenu onCollapseChange={handleSidebarStateChange} />
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300", 
        isMobile ? "w-full px-3 py-2" : 
          sidebarCollapsed ? "ml-[70px]" : "ml-64", 
        className
      )}>
        {isMobile && (
          <div className="mb-4 flex items-center">
            <MobileMenu />
            <h1 className="text-xl font-bold ml-4">Gestão de Clientes</h1>
          </div>
        )}
        <div className={cn(
          "w-full", 
          isMobile ? "px-0" : "container px-4 py-6"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
