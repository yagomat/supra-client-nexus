
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteViewToggle } from "@/components/clientes/ClienteViewToggle";
import { ClientePaginationInfo } from "@/components/clientes/ClientePaginationInfo";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";

interface ClienteFiltersSectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: "todos" | "ativo" | "inativo";
  setStatusFilter: (value: "todos" | "ativo" | "inativo") => void;
  handleLimparFiltros: () => void;
  orderBy: ClienteOrderType;
  onOrderChange: (order: ClienteOrderType) => void;
  viewMode: 'cards' | 'matriz';
  onViewModeChange: (mode: 'cards' | 'matriz') => void;
  anoAtual: number;
  onAnoChange: (ano: number) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export const ClienteFiltersSection = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleLimparFiltros,
  orderBy,
  onOrderChange,
  viewMode,
  onViewModeChange,
  anoAtual,
  onAnoChange,
  currentPage,
  itemsPerPage,
  totalItems
}: ClienteFiltersSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <ClienteFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleLimparFiltros={handleLimparFiltros}
        orderBy={orderBy}
        onOrderChange={onOrderChange}
        viewMode={viewMode}
        anoAtual={anoAtual}
        onAnoChange={onAnoChange}
      />
      
      <div className="flex justify-between items-center">
        <ClientePaginationInfo
          viewMode={viewMode}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
        
        <ClienteViewToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>
    </div>
  );
};
