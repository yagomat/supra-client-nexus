
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { CryptoStorage } from "@/utils/cryptoStorage";
import { logError } from "@/utils/errorHandler";

type StatusFilterType = "todos" | "ativo" | "inativo";

interface DefaultFiltersSettingsProps {
  onFiltersChange?: (status: StatusFilterType, order: ClienteOrderType) => void;
}

export function DefaultFiltersSettings({ onFiltersChange }: DefaultFiltersSettingsProps) {
  const [defaultStatus, setDefaultStatus] = useState<StatusFilterType>("todos");
  const [defaultOrder, setDefaultOrder] = useState<ClienteOrderType>("data");

  // Carregar configurações salvas do CryptoStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedStatus = await CryptoStorage.getItem<StatusFilterType>("defaultStatusFilter");
        const savedOrder = await CryptoStorage.getItem<ClienteOrderType>("defaultOrderFilter");
        
        if (savedStatus) {
          setDefaultStatus(savedStatus);
        }
        if (savedOrder) {
          setDefaultOrder(savedOrder);
        }
      } catch (error) {
        logError(error, 'loadDefaultFilters');
      }
    };
    
    loadSettings();
  }, []);

  const handleStatusChange = (value: string) => {
    setDefaultStatus(value as StatusFilterType);
  };

  const handleOrderChange = (value: string) => {
    setDefaultOrder(value as ClienteOrderType);
  };

  const handleSave = async () => {
    try {
      await CryptoStorage.setItem("defaultStatusFilter", defaultStatus);
      await CryptoStorage.setItem("defaultOrderFilter", defaultOrder);
      
      // Notificar o componente pai sobre a mudança
      if (onFiltersChange) {
        onFiltersChange(defaultStatus, defaultOrder);
      }
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de filtro foram atualizadas com sucesso."
      });
    } catch (error) {
      logError(error, 'saveDefaultFilters');
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="card-enhanced animate-scale-in">
      <CardHeader className="bg-gradient-subtle rounded-t-lg">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Filtros Padrão
        </CardTitle>
        <CardDescription className="text-base">
          Configure os filtros que serão aplicados por padrão na lista de clientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Padrão</label>
            <Select value={defaultStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Filtro de status que será aplicado automaticamente ao carregar a lista de clientes. (Padrão: Todos)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ordenação Padrão</label>
            <Select value={defaultOrder} onValueChange={handleOrderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Cadastro</SelectItem>
                <SelectItem value="vencimento">Vencimento</SelectItem>
                <SelectItem value="nome_asc">Nome A-Z</SelectItem>
                <SelectItem value="nome_desc">Nome Z-A</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Ordem de classificação que será aplicada automaticamente ao carregar a lista de clientes. (Padrão: Cadastro)
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
