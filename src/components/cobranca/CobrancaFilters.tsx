
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CobrancaFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const CobrancaFilters = ({
  statusFilter,
  onStatusFilterChange
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
    </div>
  );
};
