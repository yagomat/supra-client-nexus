
import { ReactNode, useEffect, useState } from "react";
import { SidebarMenu } from "@/components/SidebarMenu";
import { MobileMenu } from "@/components/MobileMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Listen for sidebar collapse state changes
  const handleSidebarStateChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Navigate to settings page
  const handleSettingsClick = () => {
    navigate("/configuracoes");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Only show sidebar in desktop mode */}
      {!isMobile && <SidebarMenu onCollapseChange={handleSidebarStateChange} />}
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300", 
        isMobile ? "w-full px-3 py-2" : 
          sidebarCollapsed ? "ml-[70px]" : "ml-64", 
        className
      )}>
        {isMobile ? (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <MobileMenu />
              <h1 className="text-xl font-bold ml-4">Gestão de Clientes</h1>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSettingsClick} 
                title="Configurações"
              >
                <Settings className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Configurações</span>
              </Button>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut} 
                title="Sair"
              >
                <LogOut className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Sair</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end container px-4 pt-2">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSettingsClick} 
                title="Configurações"
              >
                <Settings className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Configurações</span>
              </Button>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut} 
                title="Sair"
              >
                <LogOut className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Sair</span>
              </Button>
            </div>
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
