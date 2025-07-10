
import { useState, useMemo } from "react";
import { Cliente } from "@/types";

export const usePaymentMatrixPagination = (clientes: Cliente[], initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = useMemo(() => {
    return clientes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [clientes, currentPage, itemsPerPage]);
  
  // Manipulador para mudar itens por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedClientes,
    handleItemsPerPageChange
  };
};
