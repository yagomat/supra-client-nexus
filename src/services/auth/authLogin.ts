import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";

// Login seguro com validações
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // Usar função de validação segura do backend
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
      return false;
    }

    const result = validationResult as { 
      success: boolean; 
      error?: string; 
      rate_limited?: boolean;
      sanitized_email?: string;
    };
    
    if (!result.success) {
      if (result.rate_limited) {
        toast.error("Muitas tentativas de login", {
          description: result.error || "Tente novamente em 15 minutos.",
        });
      } else {
        toast.error("Falha na validação", {
          description: result.error || "Dados inválidos.",
        });
      }
      return false;
    }

    // Autenticar com Supabase usando dados sanitizados
    const { error, data } = await supabase.auth.signInWithPassword({
      email: result.sanitized_email || email,
      password: password,
    });

    if (error) {
      // Registrar falha de login no backend
      await supabase.rpc('log_auth_attempt', {
        p_email: result.sanitized_email || email,
        p_operation: 'login',
        p_success: false,
        p_error_message: error.message,
        p_ip_address: 'client-side',
        p_user_agent: navigator.userAgent
      });

      toast.error("Falha na autenticação", {
        description: error.message,
      });
      return false;
    }

    // Registrar login bem-sucedido
    await supabase.rpc('log_auth_attempt', {
      p_email: result.sanitized_email || email,
      p_operation: 'login',
      p_success: true,
      p_error_message: null,
      p_ip_address: 'client-side',
      p_user_agent: navigator.userAgent
    });

    await logAuditEvent("login_success", { email: result.sanitized_email || email }, data.user?.id);

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
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar fazer login.",
    });
    return false;
  }
};