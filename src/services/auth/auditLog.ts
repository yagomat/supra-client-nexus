
import { supabase } from "@/integrations/supabase/client";

// Registrar evento de auditoria usando uma função customizada
export const logAuditEvent = async (
  event: string,
  details: Record<string, any>,
  userId?: string
): Promise<void> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const userIdToLog = userId || currentUser.user?.id;
    
    if (!userIdToLog) return;

    // Usar a função rpc do Supabase para inserir, já que o TypeScript não reconhece a tabela automaticamente
    await supabase.rpc('log_audit_event', {
      p_user_id: userIdToLog,
      p_event_type: event,
      p_details: details,
      p_ip_address: "client-side", // Em produção, isso seria capturado pelo Edge Function
      p_user_agent: navigator.userAgent
    }).throwOnError();
    
  } catch (error) {
    console.error("Erro ao registrar evento de auditoria:", error);
  }
};
