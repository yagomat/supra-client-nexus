import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Clock, User, FileText, RefreshCw } from "lucide-react";
import { useSecureClienteOperations } from "@/hooks/cliente/useSecureClienteOperations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLogEntry {
  id: string;
  event_type: string;
  created_at: string;
  ip_address?: string;
  details: any;
}

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { getAuditLogs } = useSecureClienteOperations();

  const loadLogs = async () => {
    try {
      setLoading(true);
      const auditLogs = await getAuditLogs();
      setLogs(auditLogs);
      applyFilter(auditLogs, filter);
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (logList: AuditLogEntry[], filterType: string) => {
    let filtered = logList;
    
    if (filterType !== "all") {
      filtered = logList.filter(log => log.event_type.includes(filterType));
    }
    
    // Ordenar por data mais recente primeiro
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setFilteredLogs(filtered);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    applyFilter(logs, newFilter);
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('create')) return <FileText className="w-4 h-4" />;
    if (eventType.includes('update')) return <RefreshCw className="w-4 h-4" />;
    if (eventType.includes('delete')) return <User className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getEventColor = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    if (eventType.includes('create')) return "default";
    if (eventType.includes('update')) return "secondary";
    if (eventType.includes('delete')) return "destructive";
    return "outline";
  };

  const getEventDescription = (eventType: string, details: any) => {
    const operation = eventType.replace('cliente_', '');
    const clienteNome = details?.new_data?.nome || details?.old_data?.nome || 'Cliente';
    
    switch (operation) {
      case 'create':
        return `Cliente "${clienteNome}" foi criado`;
      case 'update':
        return `Cliente "${clienteNome}" foi atualizado`;
      case 'delete':
        return `Cliente "${clienteNome}" foi excluído`;
      case 'create_success':
        return `Criação de "${clienteNome}" realizada com sucesso`;
      case 'update_success':
        return `Atualização de "${clienteNome}" realizada com sucesso`;
      default:
        return `Operação ${operation} realizada`;
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Logs de Auditoria
        </CardTitle>
        <CardDescription>
          Histórico de operações realizadas com validação de segurança
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os eventos</SelectItem>
              <SelectItem value="create">Criações</SelectItem>
              <SelectItem value="update">Atualizações</SelectItem>
              <SelectItem value="delete">Exclusões</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando logs de auditoria...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log de auditoria encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(log.event_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getEventColor(log.event_type)}>
                          {log.event_type.replace('cliente_', '')}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      
                      <p className="text-sm">
                        {getEventDescription(log.event_type, log.details)}
                      </p>
                      
                      {log.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          IP: {log.ip_address}
                        </p>
                      )}
                      
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Ver detalhes
                          </summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  
                  {index < filteredLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};