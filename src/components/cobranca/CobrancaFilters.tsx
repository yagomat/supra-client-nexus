
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CobrancaFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  ordenacaoFilter: string;
  onOrdenacaoFilterChange: (value: string) => void;
}

export const CobrancaFilters = ({
  statusFilter,
  onStatusFilterChange,
  ordenacaoFilter,
  onOrdenacaoFilterChange
}: CobrancaFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 p-4 border-b">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os clientes</SelectItem>
          <SelectItem value="ativo">Apenas ativos</SelectItem>
          <SelectItem value="inativo">Apenas inativos</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ordenacaoFilter} onValueChange={onOrdenacaoFilterChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vencimento">Por proximidade do vencimento</SelectItem>
          <SelectItem value="vencidos_primeiro">Vencidos primeiro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
