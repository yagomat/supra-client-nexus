
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagamentos } from "@/hooks/usePagamentos";
import { PagamentosTable } from "@/components/pagamentos/PagamentosTable";
import { PagamentosMatriz } from "@/components/pagamentos/PagamentosMatriz";
import { PagamentosFiltros } from "@/components/pagamentos/PagamentosFiltros";
import { LoadingState } from "@/components/clientes/LoadingState";
import { EmptyState } from "@/components/clientes/EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";

const GestaoPagamentos = () => {
  const {
    filteredClientes,
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
    meses,
    anos
  } = usePagamentos();
  
  const isMobile = useIsMobile();

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4 md:space-y-6 px-2 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestão de Pagamentos</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Gerencie os pagamentos dos clientes e acompanhe seu status.
          </p>
        </div>

        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="matriz">Matriz</TabsTrigger>
          </TabsList>
          
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
            <>
              <TabsContent value="lista" className="pt-2">
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
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="matriz" className="pt-2">
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
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GestaoPagamentos;
