import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallbackRoute?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function BackButton({ 
  fallbackRoute = "/dashboard", 
  className,
  variant = "outline"
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to specific route
      navigate(fallbackRoute);
    }
  };

  // Don't show on main dashboard or login pages
  if (location.pathname === "/dashboard" || location.pathname === "/login" || location.pathname === "/cadastro") {
    return null;
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBack}
      className={cn(
        "gap-2 hover:shadow-soft transition-all duration-200 mb-4",
        className
      )}
      title="Voltar (Alt+←)"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Button>
  );
}