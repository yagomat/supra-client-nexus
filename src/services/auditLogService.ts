
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Tipos para os logs de auditoria
export type AuditLogRecord = {
  id: string;
  user_id: string;
  event_type: string;
  details: Json;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};

// Obter logs de auditoria descriptografados para o usuário atual
export const getUserAuditLogs = async (): Promise<AuditLogRecord[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_audit_logs_decrypted');
    
    if (error) {
      console.error("Erro ao buscar logs de auditoria:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    return [];
  }
};

// Filtrar logs de auditoria (usando a função original que não precisa descriptografar)
export const filterAuditLogs = async (
  eventType?: string,
  startDate?: Date,
  endDate?: Date
): Promise<AuditLogRecord[]> => {
  try {
    const { data, error } = await supabase.rpc('filter_audit_logs', {
      p_event_type: eventType || null,
      p_start_date: startDate ? startDate.toISOString() : null,
      p_end_date: endDate ? endDate.toISOString() : null
    });
    
    if (error) {
      console.error("Erro ao filtrar logs de auditoria:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao filtrar logs de auditoria:", error);
    return [];
  }
};

// Função para executar limpeza manual dos logs (para fins de teste)
export const cleanupOldLogs = async (retentionDays: number = 90): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('cleanup_old_audit_logs', {
      p_retention_days: retentionDays
    });
    
    if (error) {
      console.error("Erro ao limpar logs antigos:", error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error("Erro ao limpar logs antigos:", error);
    return 0;
  }
};
