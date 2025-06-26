
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagamentos } from "@/hooks/usePagamentos";
import { RegistrarPagamento } from "@/components/pagamentos/RegistrarPagamento";
import { CobrancaKanban } from "@/components/cobranca/CobrancaKanban";
import { useIsMobile } from "@/hooks/use-mobile";

const GestaoPagamentos = () => {
  const {
    filteredClientes,
    setFilteredClientes,
    clientes,
    mesAtual,
    setMesAtual,
    anoAtual,
    setAnoAtual,
    searchTerm,
    setSearchTerm,
    loading,
    submitting,
    handleChangeStatus,
    handleLimparFiltro,
    sortOrder,
    setSortOrder,
    meses,
    anos
  } = usePagamentos();
  
  const isMobile = useIsMobile();

  // Handle sort order change
  const handleSortChange = (order: 'nome' | 'data') => {
    setSortOrder(order);
  };

  return (
    <DashboardLayout title="Pagamentos">
      <div className="space-y-6 h-full flex flex-col">
        <Tabs defaultValue="cobranca" className="w-full flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full max-w-lg grid-cols-2">
            <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
            <TabsTrigger value="registrar">Registrar Pagamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cobranca" className="pt-2 flex-1 min-h-0">
            <div className="border rounded-md overflow-hidden h-full">
              <CobrancaKanban />
            </div>
          </TabsContent>

          <TabsContent value="registrar" className="pt-2 flex-1">
            <RegistrarPagamento
              filteredClientes={filteredClientes}
              anoAtual={anoAtual}
              mesAtual={mesAtual}
              onAnoChange={setAnoAtual}
              onMesChange={setMesAtual}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={handleLimparFiltro}
              loading={loading}
              submitting={submitting}
              onChangeStatus={handleChangeStatus}
              meses={meses}
              anos={anos}
              isMobile={isMobile}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GestaoPagamentos;
