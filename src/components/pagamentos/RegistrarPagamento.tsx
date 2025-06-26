
import { useState } from "react";
import { PagamentosFiltros } from "./PagamentosFiltros";
import { PagamentosTable } from "./PagamentosTable";
import { PagamentosMatriz } from "./PagamentosMatriz";
import { ViewToggle } from "./ViewToggle";
import { LoadingState } from "@/components/clientes/LoadingState";
import { EmptyState } from "@/components/clientes/EmptyState";
import { ClienteComPagamentos } from "@/types";

interface RegistrarPagamentoProps {
  filteredClientes: ClienteComPagamentos[];
  anoAtual: number;
  mesAtual: number;
  onAnoChange: (ano: number) => void;
  onMesChange: (mes: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  loading: boolean;
  submitting: boolean;
  onChangeStatus: (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => void;
  meses: { value: number, label: string }[];
  anos: number[];
  isMobile?: boolean;
  sortOrder?: 'nome' | 'data';
  onSortChange?: (sortOrder: 'nome' | 'data') => void;
}

export const RegistrarPagamento = ({
  filteredClientes,
  anoAtual,
  mesAtual,
  onAnoChange,
  onMesChange,
  searchTerm,
  onSearchChange,
  onClearSearch,
  loading,
  submitting,
  onChangeStatus,
  meses,
  anos,
  isMobile = false,
  sortOrder = 'data',
  onSortChange
}: RegistrarPagamentoProps) => {
  const [viewMode, setViewMode] = useState<'lista' | 'matriz'>('lista');

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <PagamentosFiltros 
        anoAtual={anoAtual}
        mesAtual={mesAtual}
        onAnoChange={onAnoChange}
        onMesChange={onMesChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        isListView={viewMode === 'lista'}
        meses={meses}
        anos={anos}
        isMobile={isMobile}
      />

      {/* Toggle Lista/Matriz */}
      <div className="flex justify-end">
        <ViewToggle 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isMobile={isMobile}
        />
      </div>

      {/* Conteúdo */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="border rounded-md overflow-hidden">
          {filteredClientes.length === 0 ? (
            <EmptyState />
          ) : viewMode === 'lista' ? (
            <PagamentosTable 
              clientes={filteredClientes}
              mesAtual={mesAtual}
              anoAtual={anoAtual}
              submitting={submitting}
              onChangeStatus={onChangeStatus}
              isMobile={isMobile}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
          ) : (
            <PagamentosMatriz 
              clientes={filteredClientes}
              meses={meses}
              anoAtual={anoAtual}
              submitting={submitting}
              onChangeStatus={onChangeStatus}
              isMobile={isMobile}
            />
          )}
        </div>
      )}
    </div>
  );
};
