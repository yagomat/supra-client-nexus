
import { supabase } from "@/integrations/supabase/client";
import { secureLog, logError } from "@/utils/secureLogger";
import { securityLogger } from "@/utils/contextualLogger";

// Registrar evento de auditoria com proteções de segurança automáticas
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

    // A função log_audit_event agora aplica automaticamente:
    // - Mascaramento de IP
    // - Simplificação de User-Agent  
    // - Criptografia de dados sensíveis
    await supabase.rpc('log_audit_event', {
      p_user_id: userIdToLog,
      p_event_type: event,
      p_details: details,
      p_ip_address: "client-side", // Em produção, isso seria capturado pelo Edge Function
      p_user_agent: navigator.userAgent
    }).throwOnError();
    
    // Log seguro apenas com informações não sensíveis
    securityLogger.suspeito('Audit event logged', { 
      eventType: event, 
      hasDetails: !!details,
      detailsKeyCount: Object.keys(details).length
    });
    
  } catch (error) {
    logError(error as Error, "Audit log registration", { event });
  }
};
