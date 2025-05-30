
import { TableCell, TableRow } from "@/components/ui/table";
import { ClienteComPagamentos } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { PaymentStatusCell } from "./PaymentStatusCell";
import { ClientStatusBadge } from "./ClientStatusBadge";

interface ClienteRowProps {
  cliente: ClienteComPagamentos;
  mesAtual: number;
  anoAtual: number;
  submitting: boolean;
  onChangeStatus: (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => void;
  isMobile?: boolean;
  isAlternate?: boolean;
}

export const ClienteRow = ({
  cliente,
  mesAtual,
  anoAtual,
  submitting,
  onChangeStatus,
  isMobile = false,
  isAlternate = false
}: ClienteRowProps) => {
  // Use the status directly from the cliente object that is updated by the parent component
  // through the centralized real-time subscription in useClientesPagamentos
  const clienteStatus = cliente.status;

  // Formatar valor do plano para exibição
  const valorPlanoFormatado = cliente.valor_plano 
    ? `R$ ${cliente.valor_plano.toFixed(2).replace('.', ',')}`
    : "-";

  return (
    <TableRow className={isAlternate ? "bg-muted/10" : "bg-background"}>
      {!isMobile && <TableCell>{formatDate(cliente.created_at)}</TableCell>}
      <TableCell className="font-medium">{cliente.nome}</TableCell>
      <TableCell>{cliente.dia_vencimento}</TableCell>
      {!isMobile && <TableCell>{valorPlanoFormatado}</TableCell>}
      <TableCell>
        <ClientStatusBadge status={clienteStatus} />
      </TableCell>
      <TableCell>
        <PaymentStatusCell
          cliente={cliente}
          mesAtual={mesAtual}
          anoAtual={anoAtual}
          submitting={submitting}
          onChangeStatus={onChangeStatus}
          isMobile={isMobile}
        />
      </TableCell>
    </TableRow>
  );
};
