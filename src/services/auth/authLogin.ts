
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";

// Login direto sem rate limiting
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // Fazer login diretamente com Supabase sem validações de rate limiting
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    // Registrar resultado da autenticação
    const authSuccess = !error;
    const sanitizedEmail = email.toLowerCase().trim();

    await logAuditEvent("auth_login_attempt", { 
      email: sanitizedEmail, 
      success: authSuccess, 
      error: error?.message || null,
      user_id: data.user?.id || null,
      ip_address: 'client-side',
      user_agent: navigator.userAgent 
    });

    if (error) {
      toast.error("Falha na autenticação", {
        description: error.message,
      });
      return false;
    }

    // Registrar login bem-sucedido
    await logAuditEvent("login_success", { 
      email: sanitizedEmail,
      user_id: data.user?.id 
    }, data.user?.id);

    // Configurar expiração de sessão (8 horas)
    setupSessionExpiration(async () => {
      await supabase.auth.signOut();
      toast.warning("Sua sessão expirou", {
        description: "Por favor, faça login novamente.",
      });
    });

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    
    // Registrar erro inesperado
    await logAuditEvent("auth_login_attempt", { 
      email: email.toLowerCase().trim(), 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      ip_address: 'client-side',
      user_agent: navigator.userAgent 
    });
    
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar fazer login.",
    });
    return false;
  }
};
