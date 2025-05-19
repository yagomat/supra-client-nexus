
import { useState, useEffect } from "react";
import { ClienteComPagamentos } from "@/types";

// Export meses so it can be imported by other modules
export const meses = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" }
];

export const usePaymentFilters = (clientesComPagamentos: ClienteComPagamentos[]) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  
  const [mesAtual, setMesAtual] = useState<number>(currentMonth);
  const [anoAtual, setAnoAtual] = useState<number>(currentYear);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredClientes, setFilteredClientes] = useState<ClienteComPagamentos[]>([]);
  const [sortOrder, setSortOrder] = useState<'nome' | 'data'>('data');
  
  // Anos para os selects
  const anos = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  // Filter and sort clients based on search term and sort order
  useEffect(() => {
    let results = [...clientesComPagamentos];
    
    if (searchTerm.trim() !== "") {
      results = results.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.telefone && cliente.telefone.includes(searchTerm))
      );
    }
    
    // Apply sorting
    results = results.sort((a, b) => {
      if (sortOrder === 'nome') {
        return a.nome.localeCompare(b.nome);
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    setFilteredClientes(results);
  }, [clientesComPagamentos, searchTerm, sortOrder]);
  
  // Function to clear search filter
  const handleLimparFiltro = () => {
    setSearchTerm("");
  };
  
  return {
    mesAtual,
    setMesAtual,
    anoAtual,
    setAnoAtual,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    setFilteredClientes,
    handleLimparFiltro,
    sortOrder,
    setSortOrder,
    meses,
    anos
  };
};
