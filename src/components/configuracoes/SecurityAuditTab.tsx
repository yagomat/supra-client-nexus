import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Eye, RefreshCw, Clock, User, Globe, Smartphone, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface AuditStats {
  total_events: number;
  auth_attempts: number;
  successful_logins: number;
  failed_attempts: number;
  recent_events: number;
}

export function SecurityAuditTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Usar a nova função que retorna dados descriptografados
      const { data, error } = await supabase.rpc('get_user_audit_logs_decrypted');
      
      if (error) {
        console.error("Erro ao carregar logs:", error);
        return;
      }

      const auditLogs = data || [];
      setLogs(auditLogs);

      // Calcular estatísticas para análise de auditoria
      const authAttempts = auditLogs.filter(log => log.event_type === 'auth_login_attempt').length;
      const successfulLogins = auditLogs.filter(log => 
        log.event_type === 'login_success' || 
        (log.event_type === 'auth_login_attempt' && log.details?.success === true)
      ).length;
      const failedAttempts = auditLogs.filter(log => 
        log.event_type === 'auth_login_attempt' && log.details?.success === false
      ).length;
      
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      const recentEvents = auditLogs.filter(log => 
        new Date(log.created_at) > last24Hours
      ).length;

      setStats({
        total_events: auditLogs.length,
        auth_attempts: authAttempts,
        successful_logins: successfulLogins,
        failed_attempts: failedAttempts,
        recent_events: recentEvents
      });

    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

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
      return <Eye className="h-4 w-4" />;
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
        return `Tentativa de login${details.success ? ' bem-sucedida' : ' falhada'} para ${details.email}`;
      case 'auth_signup_attempt':
        return `Tentativa de cadastro${details.success ? ' bem-sucedida' : ' falhada'} para ${details.email}`;
      case 'login_success':
        return `Login realizado com sucesso para ${details.email}`;
      case 'signup_success':
        return `Cadastro realizado com sucesso para ${details.email}`;
      case 'password_updated':
        return `Senha atualizada (força: ${details.password_strength || 'não informada'})`;
      case 'password_update_failed':
        return `Falha ao atualizar senha: ${details.error}`;
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

  // Verificar discrepâncias de auditoria
  const hasAuditDiscrepancy = stats && (
    stats.successful_logins > stats.auth_attempts ||
    stats.failed_attempts > stats.auth_attempts
  );

  return (
    <div className="space-y-6">
      {/* Card de estatísticas de auditoria */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estatísticas de Auditoria
              {hasAuditDiscrepancy && (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </CardTitle>
            <CardDescription>
              Análise dos eventos de segurança registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total_events}</div>
                <div className="text-sm text-muted-foreground">Total de Eventos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successful_logins}</div>
                <div className="text-sm text-muted-foreground">Logins Bem-sucedidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed_attempts}</div>
                <div className="text-sm text-muted-foreground">Tentativas Falhadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.recent_events}</div>
                <div className="text-sm text-muted-foreground">Últimas 24h</div>
              </div>
            </div>
            
            {hasAuditDiscrepancy && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Discrepância detectada</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Há mais eventos de login ({stats.successful_logins}) do que tentativas registradas ({stats.auth_attempts}). 
                  Isso pode indicar que nem todas as tentativas estão sendo auditadas corretamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            <Button variant="outline" size="sm" onClick={loadAuditLogs} disabled={loading}>
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
                  <Button variant="outline" onClick={() => setShowAllLogs(true)}>
                    Mostrar todos os {logs.length} eventos
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card informativo sobre as proteções implementadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Proteções de Privacidade Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">IPs Mascarados</p>
                <p className="text-muted-foreground">Último octeto do IP é substituído por "xxx"</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">User-Agent Simplificado</p>
                <p className="text-muted-foreground">Apenas "Mobile" ou "Desktop" é mostrado</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Dados Criptografados</p>
                <p className="text-muted-foreground">Informações sensíveis são criptografadas no banco</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Retenção Limitada</p>
                <p className="text-muted-foreground">Logs são removidos automaticamente após 90 dias</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
