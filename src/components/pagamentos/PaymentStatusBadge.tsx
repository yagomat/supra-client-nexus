
import { Badge } from "@/components/ui/badge";
import { Check, X, Gift } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: string;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "pago":
        return {
          label: "Pago",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
          icon: <Check className="w-3 h-3 mr-1" />
        };
      case "pago_confianca":
        return {
          label: "Promoção",
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
          icon: <Gift className="w-3 h-3 mr-1" />
        };
      default:
        return {
          label: "Não Pago",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
          icon: <X className="w-3 h-3 mr-1" />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={`${config.className} flex items-center text-xs font-medium`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
