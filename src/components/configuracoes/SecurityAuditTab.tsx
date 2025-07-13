
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuditStats } from "./audit/AuditStats";
import { AuditLogsList } from "./audit/AuditLogsList";
import { PrivacyProtections } from "./audit/PrivacyProtections";

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

// Função auxiliar para verificar se details tem a propriedade success
const hasSuccessProperty = (details: any): details is { success: boolean } => {
  return details && typeof details === 'object' && 'success' in details;
};

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
        (log.event_type === 'auth_login_attempt' && hasSuccessProperty(log.details) && log.details.success === true)
      ).length;
      const failedAttempts = auditLogs.filter(log => 
        log.event_type === 'auth_login_attempt' && hasSuccessProperty(log.details) && log.details.success === false
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

  return (
    <div className="space-y-6">
      {/* Estatísticas de auditoria */}
      {stats && <AuditStats stats={stats} />}

      {/* Lista de logs */}
      <AuditLogsList 
        logs={logs}
        loading={loading}
        showAllLogs={showAllLogs}
        onRefresh={loadAuditLogs}
        onShowAll={() => setShowAllLogs(true)}
      />

      {/* Proteções de privacidade */}
      <PrivacyProtections />
    </div>
  );
}
