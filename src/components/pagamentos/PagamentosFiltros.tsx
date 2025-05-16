
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  isMobile
}: PagamentosFiltrosProps) => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={anoAtual.toString()}
            onValueChange={(value) => onAnoChange(parseInt(value))}
          >
            <SelectTrigger className="w-[90px] sm:w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isListView && (
            <Select
              value={mesAtual.toString()}
              onValueChange={(value) => onMesChange(parseInt(value))}
            >
              <SelectTrigger className="w-[110px] sm:w-[150px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {isMobile ? mes.label.substring(0, 3) : mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="w-full sm:w-auto sm:ml-auto">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={onClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
