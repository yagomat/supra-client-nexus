
import { ReactNode } from "react";
import { SidebarMenu } from "@/components/SidebarMenu";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <SidebarMenu />
      <main className={cn("flex-1 overflow-auto p-6", className)}>
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  );
}
