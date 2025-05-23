
import { useState } from "react";
import { ClienteTable } from "@/components/clientes/ClienteTable";
import { EmptyState } from "@/components/clientes/EmptyState";
import { LoadingState } from "@/components/clientes/LoadingState";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteListHeader } from "@/components/clientes/ClienteListHeader";
import { Cliente } from "@/types";

interface ClienteListContentProps {
  loading: boolean;
  filteredClientes: Cliente[];
  allClientes: Cliente[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: "todos" | "ativo" | "inativo";
  setStatusFilter: (value: "todos" | "ativo" | "inativo") => void;
  handleLimparFiltros: () => void;
  verDetalhes: (cliente: Cliente) => void;
  verTelaAdicional: (cliente: Cliente) => void;
  verObservacoes: (cliente: Cliente) => void;
  confirmarExclusao: (clienteId: string) => void;
  sortOrder: 'nome' | 'data';
  onSortChange: (order: 'nome' | 'data') => void;
  onImportSuccess: () => void;
}

export const ClienteListContent = ({
  loading,
  filteredClientes,
  allClientes,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleLimparFiltros,
  verDetalhes,
  verTelaAdicional,
  verObservacoes,
  confirmarExclusao,
  sortOrder,
  onSortChange,
  onImportSuccess
}: ClienteListContentProps) => {
  // Estado para controlar a paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Resetar página atual quando os filtros mudam
  const handleSearchOrFilterChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleStatusFilterChange = (value: "todos" | "ativo" | "inativo") => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  
  // Manipulador para limpar filtros
  const handleClearFilters = () => {
    handleLimparFiltros();
    setCurrentPage(1);
  };
  
  // Manipulador para mudar itens por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Resetar para a primeira página quando mudar itens por página
  };

  return (
    <div className="flex flex-col space-y-4">
      <ClienteListHeader 
        clientes={allClientes}
        onImportSuccess={onImportSuccess}
      />

      <ClienteFilters 
        searchTerm={searchTerm}
        setSearchTerm={handleSearchOrFilterChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        handleLimparFiltros={handleClearFilters}
      />

      {loading ? (
        <LoadingState />
      ) : filteredClientes.length === 0 ? (
        <EmptyState />
      ) : (
        <ClienteTable 
          clientes={filteredClientes}
          verDetalhes={verDetalhes}
          verTelaAdicional={verTelaAdicional}
          verObservacoes={verObservacoes}
          confirmarExclusao={confirmarExclusao}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};
