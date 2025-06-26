
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCobranca } from "@/hooks/useCobranca";
import { ClienteCobrancaCard } from "./ClienteCobrancaCard";
import { CobrancaFilters } from "./CobrancaFilters";
import { LoadingState } from "@/components/clientes/LoadingState";

export const CobrancaKanban = () => {
  const {
    filaCobranca,
    loading,
    submitting,
    handleRegistrarCobranca,
    reloadFila
  } = useCobranca();

  const [statusFilter, setStatusFilter] = useState("todos");
  const [ordenacaoFilter, setOrdenacaoFilter] = useState("vencimento");

  // Filtrar e ordenar clientes
  const clientesFiltrados = useMemo(() => {
    let clientes = [...filaCobranca];

    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      clientes = clientes.filter(cliente => {
        // Verificar se o cliente está ativo/inativo baseado no status de pagamento
        const isAtivo = cliente.status_pagamento === 'pago' || cliente.status_pagamento === 'pago_confianca';
        return statusFilter === "ativo" ? isAtivo : !isAtivo;
      });
    }

    // Aplicar ordenação
    if (ordenacaoFilter === "vencidos_primeiro") {
      clientes.sort((a, b) => {
        // Primeiro: vencidos (dias negativos)
        // Segundo: por vencer (dias positivos)
        if (a.dias_para_vencimento < 0 && b.dias_para_vencimento >= 0) return -1;
        if (a.dias_para_vencimento >= 0 && b.dias_para_vencimento < 0) return 1;
        
        // Se ambos são vencidos, o mais atrasado primeiro
        if (a.dias_para_vencimento < 0 && b.dias_para_vencimento < 0) {
          return a.dias_para_vencimento - b.dias_para_vencimento;
        }
        
        // Se ambos são por vencer, o mais próximo primeiro
        if (a.dias_para_vencimento >= 0 && b.dias_para_vencimento >= 0) {
          return a.dias_para_vencimento - b.dias_para_vencimento;
        }
        
        return 0;
      });
    } else {
      // Ordenação padrão por proximidade (já vem ordenado do backend)
      clientes.sort((a, b) => a.prioridade - b.prioridade);
    }

    return clientes;
  }, [filaCobranca, statusFilter, ordenacaoFilter]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Fila de Cobrança</h2>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {clientesFiltrados.length} clientes
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={reloadFila}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <CobrancaFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ordenacaoFilter={ordenacaoFilter}
        onOrdenacaoFilterChange={setOrdenacaoFilter}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="mb-4 text-sm text-muted-foreground">
          {ordenacaoFilter === "vencidos_primeiro" 
            ? "Ordenados: vencidos primeiro, depois por proximidade do vencimento"
            : "Ordenados por proximidade do próximo pagamento (vencidos primeiro)"
          }
        </div>
        
        <div className="space-y-3">
          {clientesFiltrados.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Nenhum cliente encontrado
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <ClienteCobrancaCard
                key={cliente.cliente_id}
                cliente={cliente}
                onRegistrarCobranca={handleRegistrarCobranca}
                submitting={submitting}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
