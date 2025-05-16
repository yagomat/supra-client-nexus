
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import { ClienteComPagamentos } from "@/types";

interface PagamentosTableProps {
  clientes: ClienteComPagamentos[];
  mesAtual: number;
  anoAtual: number;
  submitting: boolean;
  onChangeStatus: (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => void;
}

export const PagamentosTable = ({ 
  clientes, 
  mesAtual, 
  anoAtual, 
  submitting,
  onChangeStatus 
}: PagamentosTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Servidor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento ({mesAtual}/{anoAtual})</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => {
            const chave = `${mesAtual}-${anoAtual}`;
            const pagamento = cliente.pagamentos[chave];
            
            return (
              <TableRow key={cliente.id}>
                <TableCell>{formatDate(cliente.created_at)}</TableCell>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell>{cliente.telefone || "-"}</TableCell>
                <TableCell>{cliente.uf || "-"}</TableCell>
                <TableCell>{cliente.servidor}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cliente.status === "ativo" ? "status-active" : "status-inactive"}
                  >
                    {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <PaymentStatusBadge status={pagamento?.status} />
                    <PaymentStatusSelect
                      status={pagamento?.status}
                      onStatusChange={(value) => 
                        onChangeStatus(cliente, mesAtual, anoAtual, value)
                      }
                      disabled={submitting}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
