
import { Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  Database,
  LogOut,
  MessageSquare
} from "lucide-react";

export function MobileMenu() {
  const { user, signOut } = useAuth();
  const location = useLocation();

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
      name: "WhatsApp",
      href: "/whatsapp",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Banco de Dados",
      href: "/banco-dados",
      icon: <Database size={20} />,
    },
  ];

  // Function to check if a specific route is active
  const isRouteActive = (href: string) => {
    // Exact match for paths like /dashboard, /pagamentos, etc.
    if (href === location.pathname) return true;
    
    // Special case for /clientes/cadastrar - only match exact path
    if (href === "/clientes/cadastrar") {
      return location.pathname === "/clientes/cadastrar";
    }
    
    // Special case for /clientes - only match exact path or editar route
    if (href === "/clientes") {
      return location.pathname === "/clientes" || location.pathname.startsWith("/clientes/editar");
    }
    
    return false;
  };

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-primary"
            aria-label="Menu"
          >
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80%] p-0">
          <div className="flex h-full flex-col bg-sidebar">
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <div className="text-white font-bold">
                Gestão de Clientes
              </div>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-sidebar-accent"
                >
                  <X size={20} />
                </Button>
              </SheetClose>
            </div>
            <div className="flex flex-col flex-grow pt-4">
              {navItems.map((item) => (
                <SheetClose key={item.href} asChild>
                  <NavLink
                    to={item.href}
                    className={
                      cn(
                        "flex items-center px-4 py-3 my-1 mx-2 rounded-md text-sm font-medium transition-colors",
                        isRouteActive(item.href)
                          ? "bg-sidebar-primary text-white"
                          : "text-white hover:bg-sidebar-accent"
                      )
                    }
                  >
                    <span className="mr-3 text-white">{item.icon}</span>
                    <span className="text-white">{item.name}</span>
                  </NavLink>
                </SheetClose>
              ))}
            </div>
            {user && (
              <div className="p-4 border-t border-sidebar-border mt-auto">
                <div className="flex items-center justify-between">
                  <div className="text-white text-sm truncate">
                    {user.nome || user.email}
                  </div>
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
