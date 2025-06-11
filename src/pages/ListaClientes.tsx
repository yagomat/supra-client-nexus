
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClienteModals } from "@/components/clientes/ClienteModals";
import { ClienteListContent } from "@/components/clientes/ClienteListContent";
import { useClienteList } from "@/hooks/cliente/useClienteList";

const ListaClientes = () => {
  const navigate = useNavigate();
  const { 
    clientes,  // Adicionado para exportação completa
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
    sortOrder,
    handleSortChange,
    handleLimparFiltros,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao,
    handleExcluir,
    fetchClientes  // Adicionado para atualizar após importação
  } = useClienteList();

  return (
    <DashboardLayout title="Lista de Clientes">
      <ClienteListContent 
        loading={loading}
        filteredClientes={filteredClientes}
        allClientes={clientes}  // Passamos todos os clientes para exportação
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleLimparFiltros={handleLimparFiltros}
        verDetalhes={verDetalhes}
        verTelaAdicional={verTelaAdicional}
        verObservacoes={verObservacoes}
        confirmarExclusao={confirmarExclusao}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onImportSuccess={fetchClientes}  // Para atualizar após importação
      />

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
