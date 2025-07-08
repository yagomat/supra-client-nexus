import { useState } from "react";
import { Plus, Users, Database, MessageSquare, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    label: "Cadastrar Cliente",
    icon: <Users className="h-4 w-4" />,
    href: "/clientes/cadastrar",
    shortcut: "Ctrl+N",
    description: "Adicionar novo cliente"
  },
  {
    label: "Ver Clientes",
    icon: <Users className="h-4 w-4" />,
    href: "/clientes",
    shortcut: "Ctrl+L",
    description: "Lista de clientes"
  },
  {
    label: "Banco de Dados",
    icon: <Database className="h-4 w-4" />,
    href: "/banco-dados",
    shortcut: "Ctrl+D",
    description: "Gerenciar dados"
  },
  {
    label: "Templates",
    icon: <MessageSquare className="h-4 w-4" />,
    href: "/templates",
    shortcut: "Ctrl+T",
    description: "Mensagens WhatsApp"
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  // Don't show on login/signup pages
  if (location.pathname === "/login" || location.pathname === "/cadastro") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-large hover:shadow-xl transition-all duration-300",
              "bg-gradient-primary hover:bg-gradient-primary/90 text-white",
              "hover:scale-105 active:scale-95",
              isOpen && "rotate-45"
            )}
            title="Ações Rápidas (Ctrl+K)"
          >
            <Plus className={cn("h-6 w-6 transition-transform duration-300", isOpen && "rotate-45")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="top" 
          align="end" 
          className="w-72 bg-card border-border/50 shadow-large animate-scale-in"
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            Ações Rápidas
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {quickActions.map((action) => (
            <DropdownMenuItem
              key={action.href}
              onClick={() => handleAction(action.href)}
              className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="text-primary mt-0.5">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {action.shortcut}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}