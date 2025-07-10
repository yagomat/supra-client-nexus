
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface PagamentosFiltrosProps {
  anoAtual: number;
  mesAtual: number;
  onAnoChange: (ano: number) => void;
  onMesChange: (mes: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  isListView: boolean;
  meses: { value: number, label: string }[];
  anos: number[];
  isMobile?: boolean;
}

export const PagamentosFiltros = ({
  anoAtual,
  mesAtual,
  onAnoChange,
  onMesChange,
  searchTerm,
  onSearchChange,
  onClearSearch,
  isListView,
  meses,
  anos,
  isMobile = false
}: PagamentosFiltrosProps) => {
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
          {/* Seletor de Ano */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Ano</label>
            <Select value={anoAtual.toString()} onValueChange={(value) => onAnoChange(parseInt(value))}>
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

          {/* Seletor de Mês - apenas para visualização de lista */}
          {isListView && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Mês</label>
              <Select value={mesAtual.toString()} onValueChange={(value) => onMesChange(parseInt(value))}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value.toString()}>
                      {mes.label}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={onClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
