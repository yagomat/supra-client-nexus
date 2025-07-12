
import { supabase } from "@/integrations/supabase/client";
import { secureLog, logError } from "@/utils/secureLogger";

// Registrar evento de auditoria consolidado com fallback em caso de erro
export const logAuditEvent = async (
  event: string,
  details: Record<string, any>,
  userId?: string
): Promise<void> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const userIdToLog = userId || currentUser.user?.id;
    
    // Para eventos de auth que não têm usuário logado, permitir user_id null
    if (!userIdToLog && !event.startsWith('auth_')) {
      secureLog.warn('Audit log attempted without user ID for non-auth event', { event });
      return;
    }

    // Preparar dados do evento com informações padronizadas
    const eventDetails = {
      ...details,
      timestamp: new Date().toISOString(),
      client_info: {
        user_agent: details.user_agent || navigator.userAgent,
        ip_address: details.ip_address || 'client-side'
      }
    };

    // Tentar inserir usando a função backend otimizada
    const { error } = await supabase.rpc('log_audit_event', {
      p_user_id: userIdToLog || null,
      p_event_type: event,
      p_details: eventDetails,
      p_ip_address: eventDetails.client_info.ip_address,
      p_user_agent: eventDetails.client_info.user_agent
    });

    if (error) {
      // Se a função RPC falhar, tentar inserção direta como fallback
      console.warn('RPC audit log failed, trying direct insert:', error.message);
      
      const { error: directError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userIdToLog || null,
          event_type: event,
          details: eventDetails,
          created_at: new Date().toISOString()
        });

      if (directError) {
        // Se tudo falhar, log apenas localmente
        secureLog.warn('All audit logging methods failed', { 
          event, 
          rpcError: error.message,
          directError: directError.message 
        });
      } else {
        secureLog.info('Audit event logged via direct insert', { 
          eventType: event, 
          hasDetails: !!details,
          userId: userIdToLog 
        });
      }
    } else {
      secureLog.info('Audit event logged successfully via RPC', { 
        eventType: event, 
        hasDetails: !!details,
        userId: userIdToLog 
      });
    }
    
  } catch (error) {
    // Fallback final: apenas log local se tudo falhar
    logError(
      error instanceof Error ? error : new Error('Unknown audit log error'), 
      'Audit logging failed completely', 
      { event, details }
    );
  }
};

// Função específica para logs de autenticação (compatibilidade)
export const logAuthAttempt = async (
  email: string,
  operation: string,
  success: boolean,
  errorMessage?: string
): Promise<void> => {
  await logAuditEvent(`auth_${operation}_attempt`, {
    email,
    success,
    error_message: errorMessage,
    operation
  });
};
