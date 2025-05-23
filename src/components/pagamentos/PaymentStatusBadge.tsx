
import { Badge } from "@/components/ui/badge";

type PaymentStatusOption = {
  value: string;
  label: string;
  className: string;
};

export const paymentStatusOptions: PaymentStatusOption[] = [
  { value: "nao_pago", label: "Não Pago", className: "border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-600" },
  { value: "pago", label: "Pago", className: "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-600" },
  { value: "pago_confianca", label: "Pago (confiança)", className: "border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-600" },
];

interface PaymentStatusBadgeProps {
  status: string | undefined;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  if (!status) return <Badge variant="outline" className="text-xs px-2 py-0.5">Não Registrado</Badge>;
  
  const option = paymentStatusOptions.find((o) => o.value === status);
  if (!option) return null;
  
  return (
    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${option.className}`}>
      {option.label}
    </Badge>
  );
};
