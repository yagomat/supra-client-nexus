
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusButton } from "./PaymentStatusButton";
import { ClienteComPagamentos } from "@/types";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Se for mobile, limitamos os meses exibidos para melhor visualização
  const displayMeses = isMobile ? meses.slice(0, 6) : meses;
  
  // Paginação
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClientes = clientes.slice(startIndex, startIndex + pageSize);
  
  // Manipular mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Manipular mudança de tamanho da página
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Voltar para a primeira página ao mudar o tamanho
  };
  
  return (
    <div className="overflow-x-auto">
      <ScrollableTable fixedColumns={3} className={theme === 'dark' ? 'table-dark' : ''}>
        <TableHeader>
          <TableRow>
            <TableHead className="fixed-column-1 min-w-[180px]">Nome</TableHead>
            <TableHead className="fixed-column-2 min-w-[80px]">Dia de Venc.</TableHead>
            <TableHead className="fixed-column-2 min-w-[100px]" style={{ '--left-offset': '260px' } as React.CSSProperties}>Status</TableHead>
            {displayMeses.map((mes) => (
              <TableHead key={mes.value} className="text-center min-w-[80px]">
                {isMobile ? mes.label.substring(0, 3) : mes.label.substring(0, 3)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedClientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium fixed-column-1">{cliente.nome}</TableCell>
              <TableCell className="fixed-column-2">{cliente.dia_vencimento}</TableCell>
              <TableCell className="fixed-column-2" style={{ '--left-offset': '260px' } as React.CSSProperties}>
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
      </ScrollableTable>
      
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={clientes.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
