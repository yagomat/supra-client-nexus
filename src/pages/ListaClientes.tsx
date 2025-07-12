
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClienteModals } from "@/components/clientes/ClienteModals";
import { ClienteListContent } from "@/components/clientes/ClienteListContent";
import { useClienteList } from "@/hooks/cliente/useClienteList";
import { UniversalCSRFProtection } from "@/components/security/UniversalCSRFProtection";

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
    <UniversalCSRFProtection 
      level="strict"
      showStatus={false}
      onValidationFail={() => {
        console.error('CSRF validation failed on ListaClientes');
        navigate("/dashboard");
      }}
    >
      <DashboardLayout title="Clientes">
        <div className="space-y-8 animate-fade-in">
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
    </UniversalCSRFProtection>
  );
};

export default ListaClientes;
