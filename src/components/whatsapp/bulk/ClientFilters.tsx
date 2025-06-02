
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  servidor: string;
  uf: string;
}

interface Filters {
  status: string;
  servidor: string;
  uf: string;
}

interface ClientFiltersProps {
  filters: Filters;
  clients: Cliente[];
  onFiltersChange: (updates: Partial<Filters>) => void;
}

export const ClientFilters = ({ filters, clients, onFiltersChange }: ClientFiltersProps) => {
  const getUniqueValues = (field: keyof Cliente) => {
    return [...new Set(clients.map(client => client[field]).filter(Boolean))];
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Filtros de Clientes</h4>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={(value) => 
            onFiltersChange({ status: value })
          }>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {getUniqueValues('status').map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Servidor</Label>
          <Select value={filters.servidor} onValueChange={(value) => 
            onFiltersChange({ servidor: value })
          }>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {getUniqueValues('servidor').map(servidor => (
                <SelectItem key={servidor} value={servidor}>{servidor}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>UF</Label>
          <Select value={filters.uf} onValueChange={(value) => 
            onFiltersChange({ uf: value })
          }>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {getUniqueValues('uf').map(uf => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
