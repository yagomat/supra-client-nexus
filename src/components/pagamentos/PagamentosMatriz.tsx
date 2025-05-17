
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusButton } from "./PaymentStatusButton";
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
  isMobile?: boolean;
}

export const PagamentosMatriz = ({ 
  clientes, 
  meses, 
  anoAtual, 
  submitting,
  onChangeStatus,
  isMobile = false
}: PagamentosMatrizProps) => {
  // Se for mobile, limitamos os meses exibidos para melhor visualização
  const displayMeses = isMobile ? meses.slice(0, 6) : meses;
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Dia de Venc.</TableHead>
            <TableHead>Status</TableHead>
            {displayMeses.map((mes) => (
              <TableHead key={mes.value} className="text-center">
                {isMobile ? mes.label.substring(0, 3) : mes.label.substring(0, 3)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.dia_vencimento}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cliente.status === "ativo" ? "status-active" : "status-inactive"}
                >
                  {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              {displayMeses.map((mes) => {
                const chave = `${mes.value}-${anoAtual}`;
                const pagamento = cliente.pagamentos[chave];
                // Default status is "nao_pago" (not paid)
                const status = pagamento?.status || "nao_pago";
                
                let cellClass = "";
                if (status === "pago") {
                  cellClass = "bg-success/20";
                } else if (status === "pago_confianca") {
                  cellClass = "bg-warning/20";
                } else if (status === "nao_pago") {
                  cellClass = "bg-danger/20";
                }
                
                return (
                  <TableCell key={mes.value} className={cellClass}>
                    <div className="flex justify-center">
                      <PaymentStatusButton
                        status={status}
                        onStatusChange={(value) => 
                          onChangeStatus(cliente, mes.value, anoAtual, value)
                        }
                        disabled={submitting}
                        minimal={true}
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
