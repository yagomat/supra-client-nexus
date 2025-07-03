
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cliente } from "@/types";
import { ClienteCard } from "./ClienteCard";
import { TablePagination } from "../table/TablePagination";

interface ClienteCardsGridProps {
  clientes: Cliente[];
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export const ClienteCardsGrid = ({
  clientes,
  onVerDetalhes,
  onConfirmarExclusao,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange
}: ClienteCardsGridProps) => {
  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rounded-lg shadow-sm overflow-hidden border border-border/50">
      <div className="p-4">
        <ScrollArea className="h-full">
          <div className="space-y-3">
            {paginatedClientes.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Nenhum cliente encontrado
              </div>
            ) : (
              paginatedClientes.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  onVerDetalhes={onVerDetalhes}
                  onConfirmarExclusao={onConfirmarExclusao}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Componente de paginação */}
      {onPageChange && onItemsPerPageChange && totalPages > 1 && (
        <div className="border-t p-2 bg-muted/10">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};
