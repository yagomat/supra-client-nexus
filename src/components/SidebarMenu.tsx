
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ListChecks,
  Settings,
  Database,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const SidebarMenu = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Função para verificar se a rota atual corresponde a um padrão específico
  const isPathActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    // Para não marcar duas opções ao mesmo tempo, verificamos exatamente o caminho
    return pathname === path;
  };

  return (
    <div className="space-y-1">
      <Button
        variant={isPathActive("/") ? "default" : "ghost"}
        className="w-full justify-start"
        asChild
      >
        <Link to="/">
          <LayoutDashboard className="mr-2 h-5 w-5" />
          Dashboard
        </Link>
      </Button>

      <Button
        variant={isPathActive("/cadastrar-cliente") ? "default" : "ghost"}
        className="w-full justify-start"
        asChild
      >
        <Link to="/cadastrar-cliente">
          <Users className="mr-2 h-5 w-5" />
          Cadastrar Cliente
        </Link>
      </Button>

      <Button
        variant={isPathActive("/lista-clientes") ? "default" : "ghost"}
        className="w-full justify-start"
        asChild
      >
        <Link to="/lista-clientes">
          <ListChecks className="mr-2 h-5 w-5" />
          Lista de Clientes
        </Link>
      </Button>

      <Button
        variant={isPathActive("/pagamentos") ? "default" : "ghost"}
        className="w-full justify-start"
        asChild
      >
        <Link to="/pagamentos">
          <DollarSign className="mr-2 h-5 w-5" />
          Gestão de Pagamentos
        </Link>
      </Button>

      <Button
        variant={isPathActive("/banco-dados") ? "default" : "ghost"}
        className="w-full justify-start"
        asChild
      >
        <Link to="/banco-dados">
          <Database className="mr-2 h-5 w-5" />
          Banco de Dados
        </Link>
      </Button>
    </div>
  );
};
