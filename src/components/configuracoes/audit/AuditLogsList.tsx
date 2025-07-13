
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, Clock, User, Globe, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLog {
  id: string;
  event_type: string;
  details: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface AuditLogsListProps {
  logs: AuditLog[];
  loading: boolean;
  showAllLogs: boolean;
  onRefresh: () => void;
  onShowAll: () => void;
}

// Função auxiliar para verificar se details tem a propriedade success
const hasSuccessProperty = (details: any): details is { success: boolean } => {
  return details && typeof details === 'object' && 'success' in details;
};

export function AuditLogsList({ logs, loading, showAllLogs, onRefresh, onShowAll }: AuditLogsListProps) {
  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes('login') || eventType.includes('signup')) {
      return eventType.includes('success') ? "default" : "destructive";
    }
    if (eventType.includes('password')) {
      return eventType.includes('failed') ? "destructive" : "secondary";
    }
    if (eventType.includes('profile')) {
      return "outline";
    }
    if (eventType.includes('auth_')) {
      return eventType.includes('success') ? "default" : "destructive";
    }
    if (eventType.includes('system_')) {
      return "secondary";
    }
    return "secondary";
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('auth_') || eventType.includes('login') || eventType.includes('signup')) {
      return <User className="h-4 w-4" />;
    }
    if (eventType.includes('password')) {
      return <Shield className="h-4 w-4" />;
    }
    if (eventType.includes('profile')) {
      return <Globe className="h-4 w-4" />;
    }
    if (eventType.includes('system_')) {
      return <RefreshCw className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  const getEventDescription = (log: AuditLog) => {
    const details = log.details || {};
    switch (log.event_type) {
      case 'auth_login_attempt':
        const success = hasSuccessProperty(details) ? details.success : false;
        return `Tentativa de login${success ? ' bem-sucedida' : ' falhada'} para ${details.email || 'email não informado'}`;
      case 'auth_signup_attempt':
        const signupSuccess = hasSuccessProperty(details) ? details.success : false;
        return `Tentativa de cadastro${signupSuccess ? ' bem-sucedida' : ' falhada'} para ${details.email || 'email não informado'}`;
      case 'login_success':
        return `Login realizado com sucesso para ${details.email || 'usuário'}`;
      case 'signup_success':
        return `Cadastro realizado com sucesso para ${details.email || 'usuário'}`;
      case 'password_updated':
        return `Senha atualizada (força: ${details.password_strength || 'não informada'})`;
      case 'password_update_failed':
        return `Falha ao atualizar senha: ${details.error || 'erro não especificado'}`;
      case 'profile_update':
        return `Perfil atualizado - Nome: ${details.new_nome || 'não alterado'}`;
      case 'logout_success':
        return 'Logout realizado com sucesso';
      case 'logout_all_sessions':
        return 'Logout de todas as sessões';
      case 'system_log_cleanup':
        return `Limpeza automática: ${details.deleted_count || 0} logs removidos`;
      default:
        return `Evento: ${log.event_type}`;
    }
  };

  const displayedLogs = showAllLogs ? logs : logs.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Logs de Segurança
        </CardTitle>
        <CardDescription>
          Histórico detalhado de atividades da sua conta com proteções de privacidade.
          IPs são mascarados e dados sensíveis são criptografados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            {logs.length} evento{logs.length !== 1 ? 's' : ''} registrado{logs.length !== 1 ? 's' : ''} 
            (retenção: 90 dias)
          </p>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum evento de auditoria encontrado.
          </p>
        ) : (
          <div className="space-y-3">
            {displayedLogs.map(log => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(log.event_type)}
                    <Badge variant={getEventBadgeVariant(log.event_type)}>
                      {log.event_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </div>
                </div>
                
                <p className="text-sm">{getEventDescription(log)}</p>
                
                {(log.ip_address || log.user_agent) && (
                  <div className="text-xs text-muted-foreground space-y-1 mt-2 pt-2 border-t">
                    {log.ip_address && log.ip_address !== 'client-side' && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        IP: {log.ip_address} (mascarado)
                      </div>
                    )}
                    {log.user_agent && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-3 w-3" />
                        Dispositivo: {log.user_agent}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {logs.length > 10 && !showAllLogs && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={onShowAll}>
                  Mostrar todos os {logs.length} eventos
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
