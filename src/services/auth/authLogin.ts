

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";
import { checkRateLimit, logAuthAttempt, checkIPRateLimit } from "./rateLimit";

// Login seguro com rate limiting muito permissivo
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // 1. Verificar rate limiting por email - limites muito altos
    const emailRateLimit = await checkRateLimit(email, 'login', 100, 1); // 100 tentativas em 1 minuto
    
    if (!emailRateLimit.allowed) {
      const resetTime = emailRateLimit.next_allowed_at 
        ? new Date(emailRateLimit.next_allowed_at).toLocaleTimeString()
        : 'em alguns momentos';
        
      toast.error("Muitas tentativas de login", {
        description: `Tente novamente ${resetTime}. (${emailRateLimit.current_attempts}/${emailRateLimit.max_attempts})`,
      });
      
      // Registrar apenas uma vez - tentativa bloqueada por rate limit
      await logAuditEvent("auth_login_attempt", { 
        email, 
        success: false, 
        error: 'Rate limit exceeded',
        ip_address: 'client-side',
        user_agent: navigator.userAgent 
      });
      return false;
    }

    // 2. Verificar rate limiting por IP (proteção adicional) - muito permissivo
    const ipAllowed = await checkIPRateLimit(undefined, 200, 1); // 200 tentativas em 1 minuto
    
    if (!ipAllowed) {
      toast.error("Muitas tentativas detectadas", {
        description: "Aguarde alguns momentos antes de tentar novamente.",
      });
      
      // Registrar tentativa bloqueada por IP
      await logAuditEvent("auth_login_attempt", { 
        email, 
        success: false, 
        error: 'IP rate limit exceeded',
        ip_address: 'client-side',
        user_agent: navigator.userAgent 
      });
      return false;
    }

    // 3. Usar função de validação segura do backend
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
      const errorMessage = result.rate_limited 
        ? "Muitas tentativas de login" 
        : "Falha na validação";
      
      const errorDescription = result.error || (result.rate_limited 
        ? "Tente novamente em alguns momentos." 
        : "Dados inválidos.");

      toast.error(errorMessage, {
        description: errorDescription,
      });
      
      // Registrar falha na validação
      await logAuditEvent("auth_login_attempt", { 
        email: result.sanitized_email || email, 
        success: false, 
        error: result.error,
        rate_limited: result.rate_limited,
        ip_address: 'client-side',
        user_agent: navigator.userAgent 
      });
      return false;
    }

    // 4. Autenticar com Supabase usando dados sanitizados
    const { error, data } = await supabase.auth.signInWithPassword({
      email: result.sanitized_email || email,
      password: password,
    });

    // 5. Registrar resultado da autenticação (sempre, independente do resultado)
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

    // 6. Registrar login bem-sucedido (evento separado para diferenciação)
    await logAuditEvent("login_success", { 
      email: sanitizedEmail,
      user_id: data.user?.id 
    }, data.user?.id);

    // 7. Configurar expiração de sessão (8 horas)
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

