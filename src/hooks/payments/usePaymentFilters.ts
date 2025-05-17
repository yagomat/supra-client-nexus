
import { useState, useEffect } from "react";
import { ClienteComPagamentos } from "@/types";

export interface MesData {
  value: number;
  label: string;
}

export const meses: MesData[] = [
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
  { value: 12, label: "Dezembro" },
];

export const anos = [2023, 2024, 2025, 2026, 2027];

export const usePaymentFilters = (clientesComPagamentos: ClienteComPagamentos[]) => {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClientes, setFilteredClientes] = useState<ClienteComPagamentos[]>([]);

  useEffect(() => {
    // Filtrar por termo de busca
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientesComPagamentos);
    } else {
      const filtered = clientesComPagamentos.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
          (cliente.uf && cliente.uf.toLowerCase().includes(searchTerm.toLowerCase())) ||
          cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientesComPagamentos]);

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
    handleLimparFiltro,
    meses,
    anos,
  };
};
