
import { useState, useEffect } from "react";
import { Cliente } from "@/types";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { sortClientesByOrder } from "./clienteSortUtils";

export const useClienteFilters = (clientes: Cliente[]) => {
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState<ClienteOrderType>('data');

  // Function to apply filters and sorting
  const applyFiltersAndSort = (clientesData: Cliente[]) => {
    let results = [...clientesData];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
          (cliente.uf && cliente.uf.toLowerCase().includes(searchTerm.toLowerCase())) ||
          cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.observacoes && cliente.observacoes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    results = sortClientesByOrder(results, orderBy);
    
    setFilteredClientes(results);
  };

  // Re-apply filters and sort when any of these dependencies change
  useEffect(() => {
    if (clientes.length > 0) {
      applyFiltersAndSort(clientes);
    }
  }, [clientes, searchTerm, orderBy]);

  const handleOrderChange = (order: ClienteOrderType) => {
    setOrderBy(order);
  };

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setOrderBy('data');
  };

  return {
    filteredClientes,
    searchTerm,
    setSearchTerm,
    orderBy,
    handleOrderChange,
    handleLimparFiltros,
    setFilteredClientes
  };
};
