
import { Badge } from "@/components/ui/badge";

type PaymentStatusOption = {
  value: string;
  label: string;
  className: string;
};

export const paymentStatusOptions: PaymentStatusOption[] = [
  { value: "nao_pago", label: "Não Pago", className: "payment-unpaid" },
  { value: "pago", label: "Pago", className: "payment-paid" },
  { value: "pago_confianca", label: "Pago (confiança)", className: "payment-trusted" },
];

interface PaymentStatusBadgeProps {
  status: string | undefined;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  if (!status) return <Badge variant="outline">Não Registrado</Badge>;
  
  const option = paymentStatusOptions.find((o) => o.value === status);
  if (!option) return null;
  
  return (
    <Badge variant="outline" className={option.className}>
      {option.label}
    </Badge>
  );
};
