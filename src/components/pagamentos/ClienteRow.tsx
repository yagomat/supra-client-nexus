
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
}

export const ClienteRow = ({
  cliente,
  mesAtual,
  anoAtual,
  submitting,
  onChangeStatus,
  isMobile = false
}: ClienteRowProps) => {
  return (
    <TableRow>
      {!isMobile && <TableCell>{formatDate(cliente.created_at)}</TableCell>}
      <TableCell className="font-medium">{cliente.nome}</TableCell>
      {!isMobile && <TableCell>{cliente.telefone || "-"}</TableCell>}
      {!isMobile && <TableCell>{cliente.uf || "-"}</TableCell>}
      <TableCell>{cliente.dia_vencimento}</TableCell>
      <TableCell>
        <ClientStatusBadge status={cliente.status} />
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
