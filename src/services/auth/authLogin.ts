

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";

// Login seguro sem rate limiting
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // 1. Usar função de validação segura do backend
    const { data: validationResult, error: validationError } = await supabase.rpc('secure_auth_attempt', {
      p_email: email,
      p_password: password,
      p_operation: 'login',
      p_ip_address: 'client-side',
      p_user_agent: navigator.userAgent
    });

    if (validationError) {
      console.error("Erro na validação:", validationError);
      toast.error("Erro de validação", {
        description: "Erro interno de validação.",
      });
      
      // Registrar erro de validação
      await logAuditEvent("auth_login_attempt", { 
        email, 
        success: false, 
        error: validationError.message,
        ip_address: 'client-side',
        user_agent: navigator.userAgent 
      });
      return false;
    }

    const result = validationResult as any;
    
    if (!result.success) {
      const errorMessage = "Falha na validação";
      const errorDescription = result.error || "Dados inválidos.";

      toast.error(errorMessage, {
        description: errorDescription,
      });
      
      // Registrar falha na validação
      await logAuditEvent("auth_login_attempt", { 
        email: result.sanitized_email || email, 
        success: false, 
        error: result.error,
        ip_address: 'client-side',
        user_agent: navigator.userAgent 
      });
      return false;
    }

    // 2. Autenticar com Supabase usando dados sanitizados
    const { error, data } = await supabase.auth.signInWithPassword({
      email: result.sanitized_email || email,
      password: password,
    });

    // 3. Registrar resultado da autenticação (sempre, independente do resultado)
    const authSuccess = !error;
    const sanitizedEmail = result.sanitized_email || email;

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

    // 4. Registrar login bem-sucedido (evento separado para diferenciação)
    await logAuditEvent("login_success", { 
      email: sanitizedEmail,
      user_id: data.user?.id 
    }, data.user?.id);

    // 5. Configurar expiração de sessão (8 horas)
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
      email, 
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

