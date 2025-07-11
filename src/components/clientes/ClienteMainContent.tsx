
import { ClienteCardsGrid } from "@/components/clientes/ClienteCardsGrid";
import { ClienteMatriz } from "@/components/clientes/ClienteMatriz";
import { EmptyState } from "@/components/clientes/EmptyState";
import { LoadingState } from "@/components/clientes/LoadingState";
import { Cliente } from "@/types";

interface ClienteMainContentProps {
  loading: boolean;
  filteredClientes: Cliente[];
  viewMode: 'cards' | 'matriz';
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  meses: Array<{ value: number; label: string }>;
  anoAtual: number;
  isMobile: boolean;
}

export const ClienteMainContent = ({
  loading,
  filteredClientes,
  viewMode,
  onVerDetalhes,
  onConfirmarExclusao,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  meses,
  anoAtual,
  isMobile
}: ClienteMainContentProps) => {
  if (loading) {
    return <LoadingState />;
  }

  if (filteredClientes.length === 0) {
    return <EmptyState />;
  }

  if (viewMode === 'cards') {
    return (
      <ClienteCardsGrid 
        clientes={filteredClientes}
        onVerDetalhes={onVerDetalhes}
        onConfirmarExclusao={onConfirmarExclusao}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    );
  }

  return (
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
  );
};
