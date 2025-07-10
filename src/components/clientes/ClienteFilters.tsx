
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { ClienteOrderSelector, ClienteOrderType } from "./ClienteOrderSelector";

interface ClienteFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: "todos" | "ativo" | "inativo";
  setStatusFilter: (value: "todos" | "ativo" | "inativo") => void;
  handleLimparFiltros: () => void;
  orderBy: ClienteOrderType;
  onOrderChange: (order: ClienteOrderType) => void;
  viewMode?: 'cards' | 'matriz';
  anoMatriz?: number;
  onAnoMatrizChange?: (ano: number) => void;
}

export const ClienteFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleLimparFiltros,
  orderBy,
  onOrderChange,
  viewMode = 'cards',
  anoMatriz,
  onAnoMatrizChange
}: ClienteFiltersProps) => {
  const currentYear = new Date().getFullYear();
  
  // Gerar anos de 4 anos atrás até 4 anos à frente
  const extendedYears = Array.from(
    { length: 9 }, 
    (_, i) => currentYear - 4 + i
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          {/* Filtro de status */}
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de ordenação */}
          <ClienteOrderSelector 
            orderBy={orderBy}
            onOrderChange={onOrderChange}
          />

          {/* Seletor de ano - apenas para modo matriz */}
          {viewMode === 'matriz' && anoMatriz !== undefined && onAnoMatrizChange && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Ano</label>
              <Select value={anoMatriz.toString()} onValueChange={(value) => onAnoMatrizChange(parseInt(value))}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {extendedYears.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Campo de busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleLimparFiltros}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
