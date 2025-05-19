
import { ClienteTable } from "@/components/clientes/ClienteTable";
import { EmptyState } from "@/components/clientes/EmptyState";
import { LoadingState } from "@/components/clientes/LoadingState";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteListHeader } from "@/components/clientes/ClienteListHeader";
import { Cliente } from "@/types";

interface ClienteListContentProps {
  loading: boolean;
  filteredClientes: Cliente[];
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
}

export const ClienteListContent = ({
  loading,
  filteredClientes,
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
  onSortChange
}: ClienteListContentProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <ClienteListHeader />

      <ClienteFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleLimparFiltros={handleLimparFiltros}
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
        />
      )}
    </div>
  );
};
