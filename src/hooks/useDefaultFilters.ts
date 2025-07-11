
import { useState, useEffect } from "react";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { CryptoStorage } from "@/utils/cryptoStorage";
import { logError } from "@/utils/errorHandler";

type StatusFilterType = "todos" | "ativo" | "inativo";

export const useDefaultFilters = () => {
  const [defaultStatus, setDefaultStatus] = useState<StatusFilterType>("ativo");
  const [defaultOrder, setDefaultOrder] = useState<ClienteOrderType>("vencimento");

  // Carregar configurações do storage criptografado na inicialização
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const savedStatus = await CryptoStorage.getItem<StatusFilterType>("defaultStatusFilter");
        const savedOrder = await CryptoStorage.getItem<ClienteOrderType>("defaultOrderFilter");
        
        if (savedStatus) {
          setDefaultStatus(savedStatus);
        }
        if (savedOrder) {
          setDefaultOrder(savedOrder);
        }
      } catch (error) {
        logError(error, 'loadDefaultFilters');
      }
    };
    
    loadDefaults();
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
