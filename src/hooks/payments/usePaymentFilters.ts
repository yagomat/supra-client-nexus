
import { useState, useEffect } from "react";
import { ClienteComPagamentos } from "@/types";

export const usePaymentFilters = (clientesComPagamentos: ClienteComPagamentos[]) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  
  const [mesAtual, setMesAtual] = useState<number>(currentMonth);
  const [anoAtual, setAnoAtual] = useState<number>(currentYear);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredClientes, setFilteredClientes] = useState<ClienteComPagamentos[]>([]);
  
  // Meses e anos para os selects
  const meses = [
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
  
  const anos = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  // Filter clients based on search term
  useEffect(() => {
    let results = [...clientesComPagamentos];
    
    if (searchTerm.trim() !== "") {
      results = results.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.telefone && cliente.telefone.includes(searchTerm))
      );
    }
    
    setFilteredClientes(results);
  }, [clientesComPagamentos, searchTerm]);
  
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
    meses,
    anos
  };
};
