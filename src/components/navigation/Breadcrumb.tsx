import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Clientes",
  "/clientes/cadastrar": "Cadastrar Cliente",
  "/clientes/editar": "Editar Cliente",
  "/banco-dados": "Dados de Cadastro",
  "/templates": "Templates",
  "/configuracoes": "Configurações",
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Início",
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />
    }
  ];

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbItems.push({
      label,
      href: index === pathSegments.length - 1 ? undefined : currentPath,
    });
  });

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4 animate-fade-in">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className={cn(
                "flex items-center gap-1 hover:text-primary transition-colors hover:underline",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1 text-foreground font-medium">
              {item.icon}
              <span>{item.label}</span>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}