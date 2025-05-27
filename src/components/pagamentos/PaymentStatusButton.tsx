import { Button } from "@/components/ui/button";
import { Check, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentStatusButtonProps {
  status?: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
  minimal?: boolean;
  isList?: boolean;
}

export const PaymentStatusButton = ({
  status,
  onStatusChange,
  disabled = false,
  minimal = false,
  isList = false
}: PaymentStatusButtonProps) => {
  // Use local state that stays synchronized with prop changes
  const [currentStatus, setCurrentStatus] = useState(status || "nao_pago");
  
  // Keep local state in sync with props
  useEffect(() => {
    if (status !== undefined) {
      setCurrentStatus(status);
    }
  }, [status]);
  
  const handleClick = () => {
    // Cycle through status options: nao_pago -> pago -> pago_confianca -> nao_pago
    const nextStatus = 
      currentStatus === "nao_pago" ? "pago" :
      currentStatus === "pago" ? "pago_confianca" : "nao_pago";
    
    onStatusChange(nextStatus);
  };
  
  // Define button appearance based on status
  const getButtonAppearance = () => {
    switch (currentStatus) {
      case "pago":
        return {
          variant: "outline" as const,
          className: "border-green-500 text-green-600 hover:bg-green-100 bg-green-50",
          icon: <Check className="size-4" />,
          label: "Pago",
          shortLabel: "PG"
        };
      case "pago_confianca":
        return {
          variant: "outline" as const,
          className: "border-amber-500 text-amber-600 hover:bg-amber-100 bg-amber-50",
          icon: <ShieldCheck className="size-4" />,
          label: "Pago (confiança)",
          shortLabel: "PC"
        };
      default: // nao_pago
        return {
          variant: "outline" as const,
          className: "border-red-500 text-red-600 hover:bg-red-100 bg-red-50",
          icon: <X className="size-4" />,
          label: "Não Pago",
          shortLabel: "NP"
        };
    }
  };
  
  const appearance = getButtonAppearance();
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={appearance.variant}
          className={appearance.className}
          size="sm"
          disabled={disabled}
          onClick={handleClick}
        >
          {appearance.icon}
          {!minimal && !isList && <span className="ml-1">{appearance.shortLabel}</span>}
          {minimal && <span className="sr-only">{appearance.label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{appearance.label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
