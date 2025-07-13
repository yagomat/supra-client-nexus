
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";
import { checkRateLimit, logAuthAttempt, checkIPRateLimit } from "./rateLimit";

// Login seguro com rate limiting robusto no backend
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // 1. Verificar rate limiting por email
    const emailRateLimit = await checkRateLimit(email, 'login', 5, 15);
    
    if (!emailRateLimit.allowed) {
      const resetTime = emailRateLimit.next_allowed_at 
        ? new Date(emailRateLimit.next_allowed_at).toLocaleTimeString()
        : 'em alguns minutos';
        
      toast.error("Muitas tentativas de login", {
        description: `Tente novamente ${resetTime}. (${emailRateLimit.current_attempts}/${emailRateLimit.max_attempts})`,
      });
      
      await logAuthAttempt(email, 'login', false, 'Rate limit exceeded');
      return false;
    }

    // 2. Verificar rate limiting por IP (proteção adicional)
    const ipAllowed = await checkIPRateLimit();
    
    if (!ipAllowed) {
      toast.error("Muitas tentativas detectadas", {
        description: "Aguarde alguns minutos antes de tentar novamente.",
      });
      
      await logAuthAttempt(email, 'login', false, 'IP rate limit exceeded');
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
      
      await logAuthAttempt(email, 'login', false, validationError.message);
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
      
      await logAuthAttempt(email, 'login', false, result.error);
      return false;
    }

    // 4. Autenticar com Supabase usando dados sanitizados
    const { error, data } = await supabase.auth.signInWithPassword({
      email: result.sanitized_email || email,
      password: password,
    });

    if (error) {
      await logAuthAttempt(
        result.sanitized_email || email, 
        'login', 
        false, 
        error.message
      );

      toast.error("Falha na autenticação", {
        description: error.message,
      });
      return false;
    }

    // 5. Registrar login bem-sucedido
    await logAuthAttempt(
      result.sanitized_email || email, 
      'login', 
      true, 
      'Login successful'
    );

    await logAuditEvent("login_success", { email: result.sanitized_email || email }, data.user?.id);

    // 6. Configurar expiração de sessão (8 horas)
    setupSessionExpiration(async () => {
      await supabase.auth.signOut();
      toast.warning("Sua sessão expirou", {
        description: "Por favor, faça login novamente.",
      });
    });

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    
    await logAuthAttempt(
      email, 
      'login', 
      false, 
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar fazer login.",
    });
    return false;
  }
};
