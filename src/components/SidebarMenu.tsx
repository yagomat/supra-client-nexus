
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  MessageSquare,
  Settings,
  ChevronLeft, 
  ChevronRight
} from "lucide-react";

export function SidebarMenu({ onCollapseChange }: { onCollapseChange?: (collapsed: boolean) => void }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapseChange) {
      onCollapseChange(!isCollapsed);
    }
  };

  useEffect(() => {
    // Notificar o componente pai sobre o estado inicial
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, []);

  const menuItems = [
    { path: "/dashboard", icon: <LayoutDashboard />, text: "Dashboard" },
    { path: "/clientes", icon: <Users />, text: "Clientes" },
    { path: "/banco-dados", icon: <Database />, text: "Dados de Cadastro" },
    { path: "/templates", icon: <MessageSquare />, text: "Templates" },
    { path: "/configuracoes", icon: <Settings />, text: "Configurações" }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-border bg-sidebar shadow-soft transition-all duration-300 ${isCollapsed ? "w-[70px]" : "w-64"}`}>
      <div className={`flex items-center p-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <span className="text-xl font-semibold text-sidebar-foreground">
            Gestor Connect
          </span>
        )}
        <button 
          onClick={toggleCollapse} 
          className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
              isActive(item.path)
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-soft hover:scale-[1.02]"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? item.text : undefined}
          >
            <div className={`w-5 h-5 ${isActive(item.path) ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"} transition-colors`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="ml-3 font-medium transition-all duration-200 group-hover:translate-x-0.5">
                {item.text}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
