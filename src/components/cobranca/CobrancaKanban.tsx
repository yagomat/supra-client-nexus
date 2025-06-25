
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

  const clientesVencidos = filaCobranca.filter(c => c.dias_para_vencimento < 0 && c.status_pagamento === 'nao_pago');
  const clientesHoje = filaCobranca.filter(c => c.dias_para_vencimento === 0 && c.status_pagamento === 'nao_pago');
  const clientesProximos = filaCobranca.filter(c => c.dias_para_vencimento > 0 && c.dias_para_vencimento <= 3 && c.status_pagamento === 'nao_pago');
  const clientesFuturos = filaCobranca.filter(c => c.dias_para_vencimento > 3 && c.status_pagamento === 'nao_pago');
  const clientesPagos = filaCobranca.filter(c => c.status_pagamento === 'pago' || c.status_pagamento === 'pago_confianca');

  const renderSection = (title: string, clientes: typeof filaCobranca, color: string) => (
    <div className="mb-6">
      <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${color}`}>
        <Users className="w-4 h-4" />
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs bg-white/80 px-2 py-1 rounded-full">
          {clientes.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {clientes.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            Nenhum cliente nesta categoria
          </div>
        ) : (
          clientes.map((cliente) => (
            <ClienteCobrancaCard
              key={cliente.cliente_id}
              cliente={cliente}
              onRegistrarCobranca={handleRegistrarCobranca}
              submitting={submitting}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Fila de Cobrança</h2>
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
        {renderSection("🚨 Vencidos", clientesVencidos, "bg-red-50 text-red-700")}
        {renderSection("⚠️ Vence Hoje", clientesHoje, "bg-orange-50 text-orange-700")}
        {renderSection("📅 Próximos Dias", clientesProximos, "bg-yellow-50 text-yellow-700")}
        {renderSection("📋 Futuros", clientesFuturos, "bg-blue-50 text-blue-700")}
        {renderSection("✅ Pagos", clientesPagos, "bg-green-50 text-green-700")}
      </ScrollArea>
    </div>
  );
};
