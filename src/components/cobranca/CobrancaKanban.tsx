
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

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    let clientes = [...filaCobranca];

    // Aplicar filtro de status baseado no status do cliente, não no pagamento
    if (statusFilter !== "todos") {
      clientes = clientes.filter(cliente => {
        return statusFilter === "ativo" ? 
          cliente.cliente_status === 'ativo' : 
          cliente.cliente_status === 'inativo';
      });
    }

    // Ordenação padrão por proximidade (já vem ordenado do backend)
    clientes.sort((a, b) => a.prioridade - b.prioridade);

    return clientes;
  }, [filaCobranca, statusFilter]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between p-4 border-b bg-background">
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
      />

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {filaCobranca.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Nenhum cliente na fila de cobrança
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Ordenados por proximidade do próximo pagamento (vencidos primeiro)
                </div>
                
                <div className="space-y-3 pb-4">
                  {clientesFiltrados.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      Nenhum cliente encontrado com o filtro selecionado
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
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
