
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  Database,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function SidebarMenu({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Don't render the sidebar at all on mobile
  if (isMobile) {
    return null;
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Cadastrar Cliente",
      href: "/clientes/cadastrar",
      icon: <UserPlus size={20} />,
    },
    {
      name: "Lista de Clientes",
      href: "/clientes",
      icon: <Users size={20} />,
    },
    {
      name: "Gestão de Pagamentos",
      href: "/pagamentos",
      icon: <CreditCard size={20} />,
    },
    {
      name: "Banco de Dados",
      href: "/banco-dados",
      icon: <Database size={20} />,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar fixed z-20 transition-all duration-300 shadow-lg",
        collapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="text-white font-bold">
            Gestão de Clientes
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-sidebar-accent"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronLeft size={20} /> : <X size={20} />}
        </Button>
      </div>

      <div className="flex flex-col flex-grow pt-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 my-1 mx-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-white"
                  : "text-white hover:bg-sidebar-accent hover:text-white"
              )
            }
          >
            <span className="mr-3 text-white">{item.icon}</span>
            {!collapsed && <span className="text-white">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {user && (
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="text-white text-sm truncate">
                {user.nome || user.email}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-sidebar-accent"
              onClick={signOut}
              title="Sair"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
