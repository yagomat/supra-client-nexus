
import { useState } from "react";
import { Cliente } from "@/types";
import { verificarLicencasCliente } from "@/services/clienteService/clienteLicencaService";

export const useClienteModals = () => {
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTelaAdicionaModalOpen, setIsTelaAdicionaModalOpen] = useState(false);
  const [isObservacoesModalOpen, setIsObservacoesModalOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<string | null>(null);

  const verDetalhes = async (cliente: Cliente) => {
    try {
      // Verificar licenças ao abrir detalhes
      const licencasResult = await verificarLicencasCliente(cliente.id);
      
      // Adicionar informações de licença ao cliente para exibição
      const clienteComLicencas = {
        ...cliente,
        licencaInfo: licencasResult
      };
      
      setClienteDetalhes(clienteComLicencas as any);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Erro ao verificar licenças:", error);
      // Se falhar a verificação de licenças, continua exibindo os detalhes normalmente
      setClienteDetalhes(cliente);
      setIsViewModalOpen(true);
    }
  };

  const verTelaAdicional = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsTelaAdicionaModalOpen(true);
  };

  const verObservacoes = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsObservacoesModalOpen(true);
  };

  const confirmarExclusao = (clienteId: string) => {
    setClienteParaExcluir(clienteId);
  };

  return {
    clienteDetalhes,
    isViewModalOpen,
    setIsViewModalOpen,
    isTelaAdicionaModalOpen,
    setIsTelaAdicionaModalOpen,
    isObservacoesModalOpen,
    setIsObservacoesModalOpen,
    clienteParaExcluir,
    setClienteParaExcluir,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao
  };
};
