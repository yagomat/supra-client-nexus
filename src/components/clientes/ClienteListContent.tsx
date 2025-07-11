
import { useState, useEffect } from "react";
import { Cliente } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { ClienteActionButtons } from "@/components/clientes/ClienteActionButtons";
import { ClienteFiltersSection } from "@/components/clientes/ClienteFiltersSection";
import { ClienteMainContent } from "@/components/clientes/ClienteMainContent";

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
  orderBy: ClienteOrderType;
  onOrderChange: (order: ClienteOrderType) => void;
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
  confirmarExclusao,
  orderBy,
  onOrderChange,
  onImportSuccess
}: ClienteListContentProps) => {
  const isMobile = useIsMobile();
  
  // Estado para controlar a paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'cards' | 'matriz'>('cards');
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  
  // Meses para a matriz
  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" }
  ];

  // Resetar ano para o ano atual quando sair do modo matriz
  useEffect(() => {
    if (viewMode === 'cards') {
      const currentYear = new Date().getFullYear();
      if (anoAtual !== currentYear) {
        setAnoAtual(currentYear);
      }
    }
  }, [viewMode, anoAtual]);
  
  // Resetar página atual quando os filtros mudam
  const handleSearchOrFilterChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleStatusFilterChange = (value: "todos" | "ativo" | "inativo") => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  
  const handleClearFilters = () => {
    handleLimparFiltros();
    setCurrentPage(1);
    setAnoAtual(new Date().getFullYear());
  };
  
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleAnoChange = (ano: number) => {
    setAnoAtual(ano);
  };

  return (
    <div className="space-y-6 w-full overflow-hidden">
      <ClienteActionButtons
        allClientes={allClientes}
        onImportSuccess={onImportSuccess}
      />

      <ClienteFiltersSection
        searchTerm={searchTerm}
        setSearchTerm={handleSearchOrFilterChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        handleLimparFiltros={handleClearFilters}
        orderBy={orderBy}
        onOrderChange={onOrderChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        anoAtual={anoAtual}
        onAnoChange={handleAnoChange}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredClientes.length}
      />

      <ClienteMainContent
        loading={loading}
        filteredClientes={filteredClientes}
        viewMode={viewMode}
        onVerDetalhes={verDetalhes}
        onConfirmarExclusao={confirmarExclusao}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        meses={meses}
        anoAtual={anoAtual}
        isMobile={isMobile}
      />
    </div>
  );
};
