
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Database, 
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
    { path: "/pagamentos", icon: <CreditCard />, text: "Pagamentos" },
    { path: "/banco-dados", icon: <Database />, text: "Banco de Dados" },
    { path: "/configuracoes", icon: <Settings />, text: "Configurações" }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-gray-800 shadow-sm transition-all duration-300 bg-black ${isCollapsed ? "w-[70px]" : "w-64"}`}>
      <div className={`flex items-center p-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <span className="text-xl font-semibold text-white">
            Gestor Connect
          </span>
        )}
        <button 
          onClick={toggleCollapse} 
          className="p-2 rounded-lg text-white hover:bg-gray-800"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-5 h-5">{item.icon}</div>
            {!isCollapsed && <span className="ml-3">{item.text}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
