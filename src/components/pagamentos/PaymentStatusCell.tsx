
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentStatusButton } from "./PaymentStatusButton";
import { ClienteComPagamentos } from "@/types";

interface PaymentStatusCellProps {
  cliente: ClienteComPagamentos;
  mesAtual: number;
  anoAtual: number;
  submitting: boolean;
  onChangeStatus: (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => void;
  isMobile?: boolean;
}

export const PaymentStatusCell = ({ 
  cliente, 
  mesAtual, 
  anoAtual, 
  submitting, 
  onChangeStatus,
  isMobile 
}: PaymentStatusCellProps) => {
  const chave = `${mesAtual}-${anoAtual}`;
  const pagamento = cliente.pagamentos[chave];
  // Default status is "nao_pago" (not paid)
  const status = pagamento?.status || "nao_pago";
  
  return (
    <div className="flex items-center space-x-2">
      {!isMobile && <PaymentStatusBadge status={status} />}
      <PaymentStatusButton
        status={status}
        onStatusChange={(value) => 
          onChangeStatus(cliente, mesAtual, anoAtual, value)
        }
        disabled={submitting}
        minimal={isMobile}
        isList={true}
      />
    </div>
  );
};
