
import { useState, useEffect, useMemo } from "react";
import { ClienteComPagamentos } from "@/types";
import { mesesList } from "./usePaymentData";

// Export months list for reuse
export const meses = mesesList;

export const usePaymentFilters = (clientesComPagamentos: ClienteComPagamentos[]) => {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Generate years list (4 years back, current year, 1 year ahead)
  const anos = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      currentYear - 4,
      currentYear - 3,
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1
    ];
  }, []);
  
  // Filter clients based on search term
  const filteredClientes = useMemo(() => {
    if (!searchTerm) {
      return clientesComPagamentos;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    return clientesComPagamentos.filter(cliente => 
      cliente.nome.toLowerCase().includes(searchTermLower) || 
      (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
      cliente.servidor.toLowerCase().includes(searchTermLower) ||
      (cliente.uf && cliente.uf.toLowerCase().includes(searchTermLower)) ||
      (cliente.observacoes && cliente.observacoes.toLowerCase().includes(searchTermLower))
    );
  }, [clientesComPagamentos, searchTerm]);
  
  // Function to clear filters
  const handleLimparFiltro = () => {
    setSearchTerm("");
    setMesAtual(new Date().getMonth() + 1);
  };
  
  return {
    mesAtual,
    setMesAtual,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    handleLimparFiltro,
    meses,
    anos
  };
};
