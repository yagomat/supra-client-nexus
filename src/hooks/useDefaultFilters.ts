
import { useState, useEffect } from "react";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";

type StatusFilterType = "todos" | "ativo" | "inativo";

export const useDefaultFilters = () => {
  const [defaultStatus, setDefaultStatus] = useState<StatusFilterType>("ativo");
  const [defaultOrder, setDefaultOrder] = useState<ClienteOrderType>("vencimento");

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const savedStatus = localStorage.getItem("defaultStatusFilter") as StatusFilterType;
    const savedOrder = localStorage.getItem("defaultOrderFilter") as ClienteOrderType;
    
    if (savedStatus) {
      setDefaultStatus(savedStatus);
    }
    if (savedOrder) {
      setDefaultOrder(savedOrder);
    }
  }, []);

  const getDefaultFilters = () => ({
    status: defaultStatus,
    order: defaultOrder
  });

  return {
    defaultStatus,
    defaultOrder,
    getDefaultFilters
  };
};
