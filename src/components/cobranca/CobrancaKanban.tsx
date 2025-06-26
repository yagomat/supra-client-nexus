
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCobranca } from "@/hooks/useCobranca";
import { ClienteCobrancaCard } from "./ClienteCobrancaCard";
import { LoadingState } from "@/components/clientes/LoadingState";

export const CobrancaKanban = () => {
  const {
    filaCobranca,
    loading,
    submitting,
    handleRegistrarCobranca,
    reloadFila
  } = useCobranca();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Fila de Cobrança</h2>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {filaCobranca.length} clientes
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

      <ScrollArea className="flex-1 p-4">
        <div className="mb-4 text-sm text-muted-foreground">
          Ordenados por proximidade do próximo pagamento (vencidos primeiro)
        </div>
        
        <div className="space-y-3">
          {filaCobranca.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Nenhum cliente encontrado
            </div>
          ) : (
            filaCobranca.map((cliente) => (
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
