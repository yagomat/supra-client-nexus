
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusButton } from "./PaymentStatusButton";
import { ClienteComPagamentos } from "@/types";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { TablePagination } from "../table/TablePagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Se for mobile, limitamos os meses exibidos para melhor visualização
  const displayMeses = isMobile ? meses.slice(0, 6) : meses;
  
  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Manipulador para mudar itens por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Resetar para a primeira página quando mudar itens por página
  };
  
  return (
    <div className="rounded-lg shadow-sm overflow-hidden border border-border/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Nome</TableHead>
              <TableHead className="font-medium">Dia de Venc.</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              {displayMeses.map((mes) => (
                <TableHead key={mes.value} className="text-center font-medium">
                  {isMobile ? mes.label.substring(0, 3) : mes.label.substring(0, 3)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.map((cliente, index) => (
              <TableRow key={cliente.id} className={index % 2 === 1 ? "bg-muted/10" : "bg-background"}>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell>{cliente.dia_vencimento}</TableCell>
                <TableCell>
                  <ClientStatusBadge status={cliente.status} />
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
      
      {/* Componente de paginação */}
      <div className="border-t p-2 bg-muted/10">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};
