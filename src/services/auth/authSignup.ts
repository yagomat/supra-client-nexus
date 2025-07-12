
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { checkRateLimit, logAuthAttempt, checkIPRateLimit } from "./rateLimit";

// Cadastro seguro com rate limiting robusto no backend
export const secureSignUp = async (email: string, password: string, nome: string): Promise<boolean> => {
  try {
    // 1. Verificar rate limiting por email
    const emailRateLimit = await checkRateLimit(email, 'signup', 3, 60); // Mais restritivo para cadastro
    
    if (!emailRateLimit.allowed) {
      const resetTime = emailRateLimit.next_allowed_at 
        ? new Date(emailRateLimit.next_allowed_at).toLocaleTimeString()
        : 'em uma hora';
        
      toast.error("Muitas tentativas de cadastro", {
        description: `Tente novamente ${resetTime}. (${emailRateLimit.current_attempts}/${emailRateLimit.max_attempts})`,
      });
      
      await logAuthAttempt(email, 'signup', false, 'Rate limit exceeded');
      return false;
    }

    // 2. Verificar rate limiting por IP
    const ipAllowed = await checkIPRateLimit(undefined, 10, 60); // Mais restritivo para cadastro
    
    if (!ipAllowed) {
      toast.error("Muitas tentativas detectadas", {
        description: "Aguarde uma hora antes de tentar novamente.",
      });
      
      await logAuthAttempt(email, 'signup', false, 'IP rate limit exceeded');
      return false;
    }

    // 3. Usar função de validação segura do backend
    const { data: validationResult, error: validationError } = await supabase.rpc('secure_auth_attempt', {
      p_email: email,
      p_password: password,
      p_operation: 'signup',
      p_nome: nome,
      p_ip_address: 'client-side',
      p_user_agent: navigator.userAgent
    });

    if (validationError) {
      console.error("Erro na validação:", validationError);
      toast.error("Erro de validação", {
        description: "Erro interno de validação.",
      });
      
      await logAuthAttempt(email, 'signup', false, validationError.message);
      return false;
    }

    const result = validationResult as { 
      success: boolean; 
      error?: string; 
      rate_limited?: boolean;
      sanitized_email?: string;
      sanitized_nome?: string;
      password_validation?: any;
    };
    
    if (!result.success) {
      if (result.rate_limited) {
        toast.error("Muitas tentativas de cadastro", {
          description: result.error || "Tente novamente em uma hora.",
        });
      } else if (result.password_validation) {
        toast.error("Senha fraca", {
          description: result.password_validation.errors?.join(', ') || result.error,
        });
      } else {
        toast.error("Falha na validação", {
          description: result.error || "Dados inválidos.",
        });
      }
      
      await logAuthAttempt(email, 'signup', false, result.error);
      return false;
    }

    // 4. Registrar com Supabase usando dados sanitizados
    const { error, data } = await supabase.auth.signUp({
      email: result.sanitized_email || email,
      password: password,
      options: {
        data: { nome: result.sanitized_nome || nome }
      }
    });

    if (error) {
      await logAuthAttempt(
        result.sanitized_email || email, 
        'signup', 
        false, 
        error.message
      );

      toast.error("Falha no cadastro", {
        description: error.message,
      });
      return false;
    }

    // 5. Registrar cadastro bem-sucedido
    await logAuthAttempt(
      result.sanitized_email || email, 
      'signup', 
      true, 
      'Signup successful'
    );

    await logAuditEvent("signup_success", { 
      email: result.sanitized_email || email, 
      nome: result.sanitized_nome || nome 
    }, data.user?.id);

    return true;
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    
    await logAuthAttempt(
      email, 
      'signup', 
      false, 
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar criar sua conta.",
    });
    return false;
  }
};
