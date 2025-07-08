
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClienteModals } from "@/components/clientes/ClienteModals";
import { ClienteListContent } from "@/components/clientes/ClienteListContent";
import { useOptimizedClienteList } from "@/hooks/cliente/useOptimizedClienteList";

const ListaClientes = () => {
  const navigate = useNavigate();
  const { 
    clientes,
    filteredClientes, 
    loading, 
    searchTerm, 
    setSearchTerm,
    statusFilter, 
    setStatusFilter,
    clienteDetalhes,
    isViewModalOpen,
    setIsViewModalOpen,
    isTelaAdicionaModalOpen,
    setIsTelaAdicionaModalOpen,
    isObservacoesModalOpen,
    setIsObservacoesModalOpen,
    clienteParaExcluir,
    setClienteParaExcluir,
    orderBy,
    handleOrderChange,
    handleLimparFiltros,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao,
    handleExcluir,
    fetchClientes
  } = useOptimizedClienteList();

  return (
    <DashboardLayout title="Clientes">
      <div className="space-y-8 animate-fade-in">
        {/* Header com gradiente */}
        <div className="relative p-6 bg-gradient-card rounded-lg border shadow-soft">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
          <div className="relative">
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              Gestão de Clientes
            </h2>
            <p className="text-muted-foreground">
              Gerencie todos os seus clientes, visualize status e histórico de pagamentos.
            </p>
          </div>
        </div>

        <div className="animate-slide-up">
          <ClienteListContent 
            loading={loading}
            filteredClientes={filteredClientes}
            allClientes={clientes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            handleLimparFiltros={handleLimparFiltros}
            verDetalhes={verDetalhes}
            verTelaAdicional={verTelaAdicional}
            verObservacoes={verObservacoes}
            confirmarExclusao={confirmarExclusao}
            orderBy={orderBy}
            onOrderChange={handleOrderChange}
            onImportSuccess={fetchClientes}
          />
        </div>
      </div>

      <ClienteModals 
        clienteDetalhes={clienteDetalhes}
        isViewModalOpen={isViewModalOpen}
        setIsViewModalOpen={setIsViewModalOpen}
        isTelaAdicionaModalOpen={isTelaAdicionaModalOpen}
        setIsTelaAdicionaModalOpen={setIsTelaAdicionaModalOpen}
        isObservacoesModalOpen={isObservacoesModalOpen}
        setIsObservacoesModalOpen={setIsObservacoesModalOpen}
        clienteParaExcluir={clienteParaExcluir}
        setClienteParaExcluir={setClienteParaExcluir}
        handleExcluir={handleExcluir}
      />
    </DashboardLayout>
  );
};

export default ListaClientes;
