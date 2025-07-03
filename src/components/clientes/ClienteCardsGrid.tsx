
import React from "react";
import { ClienteCard } from "./ClienteCard";
import { TablePagination } from "../table/TablePagination";
import { Cliente, ClienteComPagamentos } from "@/types";
import { usePagamentos } from "@/hooks/usePagamentos";

interface ClienteCardsGridProps {
  clientes: Cliente[];
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const ClienteCardsGrid = ({
  clientes,
  onVerDetalhes,
  onConfirmarExclusao,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: ClienteCardsGridProps) => {
  // Usar o hook de pagamentos para obter dados atualizados
  const { filteredClientes, mesAtual, anoAtual } = usePagamentos();
  
  // Função para obter o status de pagamento de um cliente
  const getClientePaymentStatus = (clienteId: string): string => {
    const clienteComPagamento = filteredClientes.find(c => c.id === clienteId);
    if (!clienteComPagamento) return "nao_pago";
    
    const chave = `${mesAtual}-${anoAtual}`;
    const pagamentoAtual = clienteComPagamento.pagamentos[chave];
    return pagamentoAtual?.status || "nao_pago";
  };

  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedClientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onVerDetalhes={onVerDetalhes}
            onConfirmarExclusao={onConfirmarExclusao}
            mesAtual={mesAtual}
            anoAtual={anoAtual}
            statusPagamento={getClientePaymentStatus(cliente.id)}
          />
        ))}
      </div>
      
      {/* Componente de paginação */}
      <div className="border-t pt-4">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
};
