
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
  viewMode?: 'cards' | 'matriz';
  anoAtual?: number;
  onAnoChange?: (ano: number) => void;
}

export const ClienteFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleLimparFiltros,
  orderBy,
  onOrderChange,
  viewMode,
  anoAtual,
  onAnoChange,
}: ClienteFiltersProps) => {
  // Gerar anos de 4 anos atrás até 4 anos à frente do ano atual
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 9 }, 
    (_, i) => currentYear - 4 + i
  );

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
      {/* Layout para tela grande: tudo em uma linha */}
      <div className="hidden xl:flex items-end gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <SortDesc className="h-4 w-4 text-muted-foreground" />
          <ClienteOrderSelector orderBy={orderBy} onOrderChange={onOrderChange} />
        </div>

        {viewMode === 'matriz' && anoAtual && onAnoChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Ano:</span>
            <Select value={anoAtual.toString()} onValueChange={(value) => onAnoChange(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleLimparFiltros}
          className="flex items-center gap-2 shrink-0 px-3"
        >
          <X className="h-4 w-4" />
          Limpar filtro
        </Button>
      </div>

      {/* Layout para tela média: busca na primeira linha, filtros na segunda, limpar filtro na terceira */}
      <div className="hidden md:block xl:hidden space-y-4">
        {/* Primeira linha: Campo de busca */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Segunda linha: Filtros, ordenação e ano */}
        <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-muted-foreground" />
            <ClienteOrderSelector orderBy={orderBy} onOrderChange={onOrderChange} />
          </div>

          {viewMode === 'matriz' && anoAtual && onAnoChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Ano:</span>
              <Select value={anoAtual.toString()} onValueChange={(value) => onAnoChange(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Terceira linha: Limpar filtro */}
        <div className="flex justify-start">
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

      {/* Layout para mobile: busca na primeira linha, filtros na segunda, ano e limpar filtro na terceira */}
      <div className="md:hidden space-y-4">
        {/* Primeira linha: Campo de busca */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Segunda linha: Filtros e ordenação */}
        <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-muted-foreground" />
            <ClienteOrderSelector orderBy={orderBy} onOrderChange={onOrderChange} />
          </div>
        </div>

        {/* Terceira linha: Ano e limpar filtro */}
        <div className="flex items-center gap-4">
          {viewMode === 'matriz' && anoAtual && onAnoChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Ano:</span>
              <Select value={anoAtual.toString()} onValueChange={(value) => onAnoChange(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
    </div>
  );
};
