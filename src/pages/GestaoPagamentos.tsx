
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagamentos } from "@/hooks/usePagamentos";
import { PagamentosTable } from "@/components/pagamentos/PagamentosTable";
import { PagamentosMatriz } from "@/components/pagamentos/PagamentosMatriz";
import { PagamentosFiltros } from "@/components/pagamentos/PagamentosFiltros";
import { CobrancaKanban } from "@/components/cobranca/CobrancaKanban";
import { LoadingState } from "@/components/clientes/LoadingState";
import { EmptyState } from "@/components/clientes/EmptyState";
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
      <div className="space-y-6">
        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="matriz">Matriz</TabsTrigger>
            <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="pt-2">
            <PagamentosFiltros 
              anoAtual={anoAtual}
              mesAtual={mesAtual}
              onAnoChange={setAnoAtual}
              onMesChange={setMesAtual}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={handleLimparFiltro}
              isListView={true}
              meses={meses}
              anos={anos}
              isMobile={isMobile}
            />

            {loading ? (
              <LoadingState />
            ) : (
              <div className="border rounded-md overflow-hidden">
                {filteredClientes.length === 0 ? (
                  <EmptyState />
                ) : (
                  <PagamentosTable 
                    clientes={filteredClientes}
                    mesAtual={mesAtual}
                    anoAtual={anoAtual}
                    submitting={submitting}
                    onChangeStatus={handleChangeStatus}
                    isMobile={isMobile}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                  />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matriz" className="pt-2">
            <PagamentosFiltros 
              anoAtual={anoAtual}
              mesAtual={mesAtual}
              onAnoChange={setAnoAtual}
              onMesChange={setMesAtual}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={handleLimparFiltro}
              isListView={false}
              meses={meses}
              anos={anos}
              isMobile={isMobile}
            />

            {loading ? (
              <LoadingState />
            ) : (
              <div className="border rounded-md overflow-hidden">
                {filteredClientes.length === 0 ? (
                  <EmptyState />
                ) : (
                  <PagamentosMatriz 
                    clientes={filteredClientes}
                    meses={meses}
                    anoAtual={anoAtual}
                    submitting={submitting}
                    onChangeStatus={handleChangeStatus}
                    isMobile={isMobile}
                  />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cobranca" className="pt-2">
            <div className="border rounded-md overflow-hidden h-[calc(100vh-12rem)]">
              <CobrancaKanban />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GestaoPagamentos;
