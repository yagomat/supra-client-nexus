
import { supabase } from "@/integrations/supabase/client";
import { secureLog, logError } from "@/utils/secureLogger";

// Registrar evento de auditoria com fallback em caso de erro
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

    // Tentar inserir diretamente na tabela como fallback
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userIdToLog,
        event_type: event,
        details: details || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      // Se falhar, log apenas localmente
      secureLog.warn('Audit log failed, logging locally only', { 
        event, 
        error: error.message 
      });
    } else {
      secureLog.info('Audit event logged successfully', { 
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
