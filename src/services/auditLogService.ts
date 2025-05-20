
import { supabase } from "@/integrations/supabase/client";

// Tipos para os logs de auditoria
export type AuditLogRecord = {
  id: string;
  user_id: string;
  event_type: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};

// Obter logs de auditoria para o usuário atual
export const getUserAuditLogs = async (): Promise<AuditLogRecord[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_audit_logs');
    
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

// Filtrar logs de auditoria
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
