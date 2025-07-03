
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentStatusButton } from "@/components/pagamentos/PaymentStatusButton";
import { Cliente } from "@/types";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { TablePagination } from "../table/TablePagination";
import { usePaymentStatus } from "@/hooks/payments/usePaymentStatus";

interface MesData {
  value: number;
  label: string;
}

interface ClienteMatrizProps {
  clientes: Cliente[];
  meses: MesData[];
  anoAtual: number;
  isMobile?: boolean;
}

export const ClienteMatriz = ({ 
  clientes, 
  meses, 
  anoAtual, 
  isMobile = false
}: ClienteMatrizProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { handleChangeStatus } = usePaymentStatus();
  
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
    setCurrentPage(1);
  };

  const handlePaymentStatusChange = async (cliente: Cliente, mes: number, status: string) => {
    try {
      const clienteComPagamentos = {
        ...cliente,
        pagamentos: {}
      };
      
      await handleChangeStatus(
        clienteComPagamentos,
        mes,
        anoAtual,
        status
      );
    } catch (error) {
      console.error("Erro ao alterar status de pagamento:", error);
    }
  };
  
  return (
    <div className="rounded-lg shadow-sm overflow-hidden border border-border/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium sticky left-0 bg-muted/50 z-30 border-r-2 border-border shadow-xl">Nome</TableHead>
              <TableHead>
                <div className="leading-tight font-medium">
                  <div>Dia de</div>
                  <div>Venc.</div>
                </div>
              </TableHead>
              <TableHead className="font-medium">Status</TableHead>
              {displayMeses.map((mes) => (
                <TableHead key={mes.value} className="text-center font-medium">
                  {isMobile ? mes.label.substring(0, 3) : mes.label.substring(0, 3)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.map((cliente, index) => {
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
                  {displayMeses.map((mes) => {
                    // Para cada mês, vamos mostrar um botão de status de pagamento
                    // Por padrão será "nao_pago" já que não temos dados de pagamento aqui
                    return (
                      <TableCell key={mes.value}>
                        <div className="flex justify-center">
                          <PaymentStatusButton
                            status="nao_pago"
                            onStatusChange={(status) => 
                              handlePaymentStatusChange(cliente, mes.value, status)
                            }
                            minimal={true}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
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
