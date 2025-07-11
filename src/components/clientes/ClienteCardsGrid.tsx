
import React from "react";
import { ClienteCard } from "./ClienteCard";
import { TablePagination } from "../table/TablePagination";
import { Cliente } from "@/types";

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
  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Obter mês e ano atuais
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // Calcular range dos itens exibidos
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, clientes.length);

  return (
    <div className="space-y-4">
      {/* Informação discreta do total de clientes */}
      {clientes.length > 0 && (
        <div className="flex justify-end mb-2">
          <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
            {startItem} até {endItem} de {clientes.length}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedClientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onVerDetalhes={onVerDetalhes}
            onConfirmarExclusao={onConfirmarExclusao}
            mesAtual={mesAtual}
            anoAtual={anoAtual}
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
