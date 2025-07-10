
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClienteModals } from "@/components/clientes/ClienteModals";
import { ClienteListContent } from "@/components/clientes/ClienteListContent";
import { useClienteList } from "@/hooks/cliente/useClienteList";

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
  } = useClienteList();

  return (
    <DashboardLayout title="Clientes">
      <div className="space-y-8 animate-fade-in">
        <div className="animate-slide-up">
          <ClienteListContent
            clientes={filteredClientes}
            allClientes={clientes}
            loading={loading}
            error={null}
            totalClientes={filteredClientes.length}
            currentPage={1}
            totalPages={1}
            itemsPerPage={10}
            onPageChange={() => {}}
            onItemsPerPageChange={() => {}}
            onImportSuccess={fetchClientes}
            onOrderChange={handleOrderChange}
            order={orderBy}
            isFiltered={filteredClientes.length !== clientes.length}
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
