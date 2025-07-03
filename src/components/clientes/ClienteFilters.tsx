
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClienteOrderSelector, ClienteOrderType } from "./ClienteOrderSelector";

interface ClienteFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: "todos" | "ativo" | "inativo";
  setStatusFilter: (value: "todos" | "ativo" | "inativo") => void;
  handleLimparFiltros: () => void;
  orderBy: ClienteOrderType;
  onOrderChange: (order: ClienteOrderType) => void;
}

export const ClienteFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleLimparFiltros,
  orderBy,
  onOrderChange,
}: ClienteFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Linha superior: Campo de busca */}
      <div className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, telefone, UF, servidor ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Linha inferior: Filtros e ordenação */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Lado esquerdo: Status e botão limpar */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrar por:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleLimparFiltros}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Limpar filtros</span>
          </Button>
        </div>

        {/* Lado direito: Ordenação */}
        <ClienteOrderSelector orderBy={orderBy} onOrderChange={onOrderChange} />
      </div>
    </div>
  );
};
