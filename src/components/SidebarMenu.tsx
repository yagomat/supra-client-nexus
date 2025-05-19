
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ListChecks,
  Database,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface SidebarMenuProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export const SidebarMenu = ({ onCollapseChange }: SidebarMenuProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  
  // Function to toggle sidebar collapse state
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };
  
  // Function to check if the route is active
  const isPathActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    // Check if the current path starts with the provided path for sub-routes
    return pathname.startsWith(path);
  };

  return (
    <div className={`bg-sidebar h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && <div className="text-white font-bold">Gestão de Clientes</div>}
        <Button
          onClick={toggleCollapse}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-sidebar-accent ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      <div className="space-y-1 p-2 flex-grow">
        <Button
          variant={isPathActive("/dashboard") ? "default" : "ghost"}
          className={`w-full justify-${collapsed ? 'center' : 'start'}`}
          asChild
        >
          <Link to="/dashboard">
            <LayoutDashboard className={`${collapsed ? '' : 'mr-2'} h-5 w-5`} />
            {!collapsed && "Dashboard"}
          </Link>
        </Button>

        <Button
          variant={isPathActive("/clientes/cadastrar") ? "default" : "ghost"}
          className={`w-full justify-${collapsed ? 'center' : 'start'}`}
          asChild
        >
          <Link to="/clientes/cadastrar">
            <Users className={`${collapsed ? '' : 'mr-2'} h-5 w-5`} />
            {!collapsed && "Cadastrar Cliente"}
          </Link>
        </Button>

        <Button
          variant={isPathActive("/clientes") ? "default" : "ghost"}
          className={`w-full justify-${collapsed ? 'center' : 'start'}`}
          asChild
        >
          <Link to="/clientes">
            <ListChecks className={`${collapsed ? '' : 'mr-2'} h-5 w-5`} />
            {!collapsed && "Lista de Clientes"}
          </Link>
        </Button>

        <Button
          variant={isPathActive("/pagamentos") ? "default" : "ghost"}
          className={`w-full justify-${collapsed ? 'center' : 'start'}`}
          asChild
        >
          <Link to="/pagamentos">
            <DollarSign className={`${collapsed ? '' : 'mr-2'} h-5 w-5`} />
            {!collapsed && "Gestão de Pagamentos"}
          </Link>
        </Button>

        <Button
          variant={isPathActive("/banco-dados") ? "default" : "ghost"}
          className={`w-full justify-${collapsed ? 'center' : 'start'}`}
          asChild
        >
          <Link to="/banco-dados">
            <Database className={`${collapsed ? '' : 'mr-2'} h-5 w-5`} />
            {!collapsed && "Banco de Dados"}
          </Link>
        </Button>
      </div>
    </div>
  );
};
