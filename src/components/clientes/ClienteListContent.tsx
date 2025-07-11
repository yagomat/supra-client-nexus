import { useState, useEffect } from "react";
import { ClienteCardsGrid } from "@/components/clientes/ClienteCardsGrid";
import { ClienteMatriz } from "@/components/clientes/ClienteMatriz";
import { ClienteViewToggle } from "@/components/clientes/ClienteViewToggle";
import { EmptyState } from "@/components/clientes/EmptyState";
import { LoadingState } from "@/components/clientes/LoadingState";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteExcelButtons } from "@/components/clientes/ClienteExcelButtons";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Cliente } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";

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
  verTelaAdicional,
  verObservacoes,
  confirmarExclusao,
  orderBy,
  onOrderChange,
  onImportSuccess
}: ClienteListContentProps) => {
  const navigate = useNavigate();
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
    setAnoAtual(new Date().getFullYear()); // Reset year to current year
  };
  
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleAnoChange = (ano: number) => {
    setAnoAtual(ano);
  };

  // Calcular range dos itens exibidos para ambos os modos
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredClientes.length);

  return (
    <div className="space-y-6 w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <ClienteExcelButtons 
            clientes={allClientes} 
            onImportSuccess={onImportSuccess} 
          />
        </div>
        <div className="lg:w-64">
          <Button onClick={() => navigate("/clientes/cadastrar")} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <ClienteFilters 
          searchTerm={searchTerm}
          setSearchTerm={handleSearchOrFilterChange}
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          handleLimparFiltros={handleClearFilters}
          orderBy={orderBy}
          onOrderChange={onOrderChange}
          viewMode={viewMode}
          anoAtual={anoAtual}
          onAnoChange={handleAnoChange}
        />
        
        <div className="flex justify-between items-center">
          {/* Informação discreta do total de clientes do lado esquerdo */}
          {filteredClientes.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
              {startItem} até {endItem} de {filteredClientes.length}
            </span>
          )}
          
          {/* Placeholder vazio quando não há clientes */}
          {filteredClientes.length === 0 && (
            <div></div>
          )}
          
          <ClienteViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : filteredClientes.length === 0 ? (
        <EmptyState />
      ) : viewMode === 'cards' ? (
        <ClienteCardsGrid 
          clientes={filteredClientes}
          onVerDetalhes={verDetalhes}
          onConfirmarExclusao={confirmarExclusao}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      ) : (
        <div className="w-full overflow-hidden">
          <div className="max-w-full">
            <ClienteMatriz 
              clientes={filteredClientes}
              meses={meses}
              anoAtual={anoAtual}
              isMobile={isMobile}
            />
          </div>
        </div>
      )}
    </div>
  );
};
