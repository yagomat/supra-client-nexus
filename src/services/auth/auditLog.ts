
import { supabase } from "@/integrations/supabase/client";
import { secureLog, logError } from "@/utils/secureLogger";

// Registrar evento de auditoria usando a função corrigida do banco
export const logAuditEvent = async (
  event: string,
  details: Record<string, any>,
  userId?: string
): Promise<void> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const userIdToLog = userId || currentUser.user?.id;
    
    if (!userIdToLog) {
      secureLog.warn('Audit log attempted without user ID', { event });
      return;
    }

    // Usar a função RPC corrigida do banco de dados
    const { error } = await supabase.rpc('log_audit_event', {
      p_user_id: userIdToLog,
      p_event_type: event,
      p_details: details || {},
      p_ip_address: null,
      p_user_agent: null
    });

    if (error) {
      // Se falhar com a função RPC, tentar inserção direta como fallback
      secureLog.warn('RPC audit log failed, trying direct insert', { 
        event, 
        error: error.message 
      });
      
      const { error: insertError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userIdToLog,
          event_type: event,
          details: details || {},
          created_at: new Date().toISOString()
        });

      if (insertError) {
        secureLog.warn('Direct audit log also failed', { 
          event, 
          error: insertError.message 
        });
      } else {
        secureLog.info('Audit event logged via direct insert', { 
          eventType: event, 
          hasDetails: !!details
        });
      }
    } else {
      secureLog.info('Audit event logged successfully via RPC', { 
        eventType: event, 
        hasDetails: !!details
      });
    }
    
  } catch (error) {
    // Fallback: apenas log local se tudo falhar
    secureLog.warn('Audit logging failed completely', { 
      event, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
