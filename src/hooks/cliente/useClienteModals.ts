
import { useState } from "react";
import { Cliente } from "@/types";

export const useClienteModals = () => {
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTelaAdicionaModalOpen, setIsTelaAdicionaModalOpen] = useState(false);
  const [isObservacoesModalOpen, setIsObservacoesModalOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<string | null>(null);

  const verDetalhes = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsViewModalOpen(true);
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
