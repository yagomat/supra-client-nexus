
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  servidor: string;
  uf: string;
}

interface ClientSelectorProps {
  filteredClients: Cliente[];
  selectedClients: string[];
  onSelectAll: (checked: boolean) => void;
  onClientSelect: (clientId: string, checked: boolean) => void;
}

export const ClientSelector = ({ 
  filteredClients, 
  selectedClients, 
  onSelectAll, 
  onClientSelect 
}: ClientSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">
          Clientes ({filteredClients.length} encontrados)
        </h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
            onCheckedChange={onSelectAll}
          />
          <Label>Selecionar todos</Label>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-4">
        {filteredClients.map(client => (
          <div key={client.id} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedClients.includes(client.id)}
              onCheckedChange={(checked) => onClientSelect(client.id, checked as boolean)}
            />
            <span className="flex-1">{client.nome}</span>
            <Badge variant="outline">{client.status}</Badge>
            <span className="text-sm text-muted-foreground">{client.telefone}</span>
          </div>
        ))}
        
        {filteredClients.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Nenhum cliente encontrado com os filtros aplicados.
          </p>
        )}
      </div>
    </div>
  );
};
