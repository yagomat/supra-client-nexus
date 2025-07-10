
import { TableCell, TableRow } from "@/components/ui/table";
import { PaymentStatusButton } from "@/components/pagamentos/PaymentStatusButton";
import { Cliente } from "@/types";
import { ClienteStatusBadge } from "../ClienteStatusBadge";

interface MesData {
  value: number;
  label: string;
}

interface PaymentMatrixRowProps {
  cliente: Cliente;
  index: number;
  meses: MesData[];
  anoAtual: number;
  getStatusForClient: (clienteId: string, mes: number) => string;
  onPaymentStatusChange: (cliente: Cliente, mes: number, status: string) => void;
}

export const PaymentMatrixRow = ({
  cliente,
  index,
  meses,
  anoAtual,
  getStatusForClient,
  onPaymentStatusChange
}: PaymentMatrixRowProps) => {
  const isOdd = index % 2 === 1;
  const rowBgClass = isOdd ? "bg-muted/10" : "bg-background";
  const nameCellBgClass = isOdd ? "bg-muted" : "bg-background";

  return (
    <TableRow key={cliente.id} className={rowBgClass}>
      <TableCell className={`font-medium sticky left-0 ${nameCellBgClass} z-30 border-r-2 border-border shadow-xl`}>
        {cliente.nome}
      </TableCell>
      <TableCell>{cliente.dia_vencimento}</TableCell>
      <TableCell>
        <ClienteStatusBadge status={cliente.status || 'inativo'} />
      </TableCell>
      {meses.map((mes) => {
        const status = getStatusForClient(cliente.id, mes.value);
        
        return (
          <TableCell key={mes.value}>
            <div className="flex justify-center">
              <PaymentStatusButton
                status={status}
                onStatusChange={(newStatus) => 
                  onPaymentStatusChange(cliente, mes.value, newStatus)
                }
                minimal={true}
              />
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
};
