
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { LicencaStatusType } from "@/types";

interface LicencaStatusBadgeProps {
  status: LicencaStatusType;
  size?: "sm" | "default";
}

export const LicencaStatusBadge = ({ status, size = "default" }: LicencaStatusBadgeProps) => {
  const getStatusConfig = (status: LicencaStatusType) => {
    switch (status) {
      case "valida":
        return {
          variant: "outline" as const,
          className: "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800",
          icon: <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
          label: "Válida"
        };
      case "atencao":
        return {
          variant: "outline" as const,
          className: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-800",
          icon: <Clock className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
          label: "Atenção"
        };
      case "vencida":
        return {
          variant: "outline" as const,
          className: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800",
          icon: <AlertCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
          label: "Vencida"
        };
      case "n/a":
      default:
        return {
          variant: "outline" as const,
          className: "text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800",
          icon: <HelpCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
          label: "N/A"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${size === "sm" ? "text-xs px-2 py-0.5" : ""} flex items-center gap-1`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};
