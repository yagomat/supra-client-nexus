
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
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
  
  return (
    <div className="flex items-center space-x-2">
      {!isMobile && <PaymentStatusBadge status={pagamento?.status} />}
      <PaymentStatusSelect
        status={pagamento?.status}
        onStatusChange={(value) => 
          onChangeStatus(cliente, mesAtual, anoAtual, value)
        }
        disabled={submitting}
        width={isMobile ? "w-[110px]" : "w-[140px]"}
        minimal={isMobile}
      />
    </div>
  );
};
