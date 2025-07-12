
import { supabase } from "@/integrations/supabase/client";
import { secureLog, logError } from "@/utils/secureLogger";

// Registrar evento de auditoria com a função corrigida
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

    // Usar a função log_audit_event corrigida
    const { error } = await supabase.rpc('log_audit_event', {
      p_user_id: userIdToLog,
      p_event_type: event,
      p_details: details ? JSON.parse(JSON.stringify(details)) : null
    });

    if (error) {
      throw error;
    }
    
    // Log seguro apenas com informações não sensíveis
    secureLog.info('Audit event logged', { 
      eventType: event, 
      hasDetails: !!details,
      detailsKeyCount: details ? Object.keys(details).length : 0
    });
    
  } catch (error) {
    logError(error as Error, "Audit log registration", { event });
  }
};
