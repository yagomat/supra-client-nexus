
import { ReactNode, useState } from "react";
import { SidebarMenu } from "@/components/SidebarMenu";
import { MobileMenu } from "@/components/MobileMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function DashboardLayout({ children, className, title }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOut } = useAuth();

  // Listen for sidebar collapse state changes
  const handleSidebarStateChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Only show sidebar in desktop mode */}
      {!isMobile && <SidebarMenu onCollapseChange={handleSidebarStateChange} />}
      
      <main className={cn(
        "flex-1 flex flex-col min-h-0", 
        isMobile ? "w-full" : 
          sidebarCollapsed ? "ml-[70px]" : "ml-64", 
        className
      )}>
        {isMobile ? (
          <div className="flex-shrink-0 p-3 flex items-center justify-between border-b sticky top-0 bg-background z-50">
            <div className="flex items-center">
              <MobileMenu />
              {title && <h1 className="text-xl font-bold ml-4">{title}</h1>}
            </div>
            <div className="flex items-center gap-1">
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
          <div className="flex-shrink-0 flex justify-between items-center px-4 py-2 border-b sticky top-0 bg-background z-50">
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            <div className="flex items-center gap-1 ml-auto">
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
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
