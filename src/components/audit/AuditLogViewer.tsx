
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Clock, User, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  event_type: string;
  details: any;
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      // Usar diretamente a função RPC do Supabase
      const { data: auditLogs, error } = await supabase.rpc('get_user_audit_logs');
      
      if (error) {
        console.error("Erro ao buscar logs de auditoria:", error);
        return;
      }
      
      setLogs(auditLogs || []);
      applyFilter(auditLogs || [], filter);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (allLogs: AuditLogEntry[], filterType: string) => {
    if (filterType === "all") {
      setFilteredLogs(allLogs);
    } else {
      const filtered = allLogs.filter(log => log.event_type.includes(filterType));
      setFilteredLogs(filtered);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilter(logs, filter);
  }, [filter, logs]);

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('auth')) return <Shield className="w-4 h-4" />;
    if (eventType.includes('cliente')) return <User className="w-4 h-4" />;
    if (eventType.includes('export')) return <FileText className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getEventBadgeColor = (eventType: string) => {
    if (eventType.includes('create') || eventType.includes('signup')) return 'bg-green-100 text-green-800';
    if (eventType.includes('delete') || eventType.includes('error')) return 'bg-red-100 text-red-800';
    if (eventType.includes('update') || eventType.includes('login')) return 'bg-blue-100 text-blue-800';
    if (eventType.includes('export')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDetails = (details: any) => {
    if (!details) return null;
    
    try {
      const detailsObj = typeof details === 'string' ? JSON.parse(details) : details;
      return Object.entries(detailsObj)
        .filter(([key, value]) => value !== null && value !== undefined)
        .map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium text-gray-600">{key}:</span>{' '}
            <span className="text-gray-900">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ));
    } catch {
      return <div className="text-sm text-gray-600">{String(details)}</div>;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Logs de Auditoria
            </CardTitle>
            <CardDescription>
              Histórico de atividades e eventos de segurança do sistema
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                <SelectItem value="auth">Autenticação</SelectItem>
                <SelectItem value="cliente">Clientes</SelectItem>
                <SelectItem value="export">Exportações</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLogs}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log encontrado para o filtro selecionado
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEventIcon(log.event_type)}
                      <Badge className={getEventBadgeColor(log.event_type)}>
                        {formatEventType(log.event_type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </div>
                  </div>
                  
                  {log.details && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-blue-200">
                      {formatDetails(log.details)}
                    </div>
                  )}
                  
                  {log.ip_address && (
                    <div className="mt-2 text-xs text-gray-500">
                      IP: {log.ip_address}
                    </div>
                  )}
                  
                  {index < filteredLogs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
