
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import { ClienteComPagamentos } from "@/types";

interface MesData {
  value: number;
  label: string;
}

interface PagamentosMatrizProps {
  clientes: ClienteComPagamentos[];
  meses: MesData[];
  anoAtual: number;
  submitting: boolean;
  onChangeStatus: (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => void;
}

export const PagamentosMatriz = ({ 
  clientes, 
  meses, 
  anoAtual, 
  submitting,
  onChangeStatus 
}: PagamentosMatrizProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            {meses.map((mes) => (
              <TableHead key={mes.value}>
                {mes.label.substring(0, 3)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cliente.status === "ativo" ? "status-active" : "status-inactive"}
                >
                  {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              {meses.map((mes) => {
                const chave = `${mes.value}-${anoAtual}`;
                const pagamento = cliente.pagamentos[chave];
                
                let cellClass = "";
                if (pagamento) {
                  if (pagamento.status === "pago") {
                    cellClass = "bg-success/20";
                  } else if (pagamento.status === "pago_confianca") {
                    cellClass = "bg-warning/20";
                  } else if (pagamento.status === "nao_pago") {
                    cellClass = "bg-danger/20";
                  }
                }
                
                return (
                  <TableCell key={mes.value} className={cellClass}>
                    <div className="flex justify-center">
                      <PaymentStatusSelect
                        status={pagamento?.status}
                        onStatusChange={(value) => 
                          onChangeStatus(cliente, mes.value, anoAtual, value)
                        }
                        disabled={submitting}
                        width="w-[100px]"
                      />
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
