
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortDesc, X } from "lucide-react";
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
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Lado esquerdo: Campo de busca, filtro de status e ordenação */}
        <div className="flex items-center gap-3 flex-1">
          {/* Campo de busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro de status */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
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
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-muted-foreground" />
            <ClienteOrderSelector orderBy={orderBy} onOrderChange={onOrderChange} />
          </div>
        </div>

        {/* Lado direito: Botão limpar filtro */}
        <Button
          variant="outline"
          onClick={handleLimparFiltros}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpar filtro
        </Button>
      </div>
    </div>
  );
};
