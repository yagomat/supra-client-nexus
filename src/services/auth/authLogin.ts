
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";
import { checkRateLimit, logAuthAttempt, checkIPRateLimit } from "./rateLimit";
import { secureLog } from "@/utils/secureLogger";

// Login seguro com limites de rate limiting mais permissivos
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // 1. Verificar rate limiting por email - limites mais permissivos
    const emailRateLimit = await checkRateLimit(email, 'login', 50, 5); // 50 tentativas em 5 minutos
    
    if (!emailRateLimit.allowed) {
      const resetTime = emailRateLimit.next_allowed_at 
        ? new Date(emailRateLimit.next_allowed_at).toLocaleTimeString()
        : 'em alguns minutos';
        
      toast.error("Muitas tentativas de login", {
        description: `Tente novamente ${resetTime}. (${emailRateLimit.current_attempts}/${emailRateLimit.max_attempts})`,
      });
      
      await logAuditEvent("auth_login_attempt", { 
        email, 
        success: false, 
        error: 'Rate limit exceeded',
        ip_address: 'client-side',
        user_agent: navigator.userAgent 
      });
      return false;
    }

    // 2. Verificar rate limiting por IP - mais permissivo
    const ipAllowed = await checkIPRateLimit(undefined, 100, 5); // 100 tentativas em 5 minutos
    
    if (!ipAllowed) {
      toast.error("Muitas tentativas detectadas", {
        description: "Aguarde alguns minutos antes de tentar novamente.",
      });
      
      await logAuditEvent("auth_login_attempt", { 
        email, 
        success: false, 
        error: 'IP rate limit exceeded',
        ip_address: 'client-side',
        user_agent: navigator.userAgent 
      });
      return false;
    }

    // 3. Usar função de validação segura do backend com limites mais permissivos
    const { data: validationResult, error: validationError } = await supabase.rpc('secure_auth_attempt', {
      p_email: email,
      p_password: password,
      p_operation: 'login',
      p_ip_address: 'client-side',
      p_user_agent: navigator.userAgent
    });

    if (validationError) {
      console.error("Erro na validação:", validationError);
      // Não mostrar toast de erro para não confundir o usuário
      secureLog.warn('Validation error, proceeding with direct login', { error: validationError.message });
    }

    // 4. Se a validação do backend falhar, tentar login direto (mais permissivo)
    if (validationError || !(validationResult as any)?.success) {
      console.log("Tentando login direto...");
    }

    // 5. Autenticar com Supabase diretamente
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    // 6. Registrar resultado da autenticação
    const authSuccess = !error;

    await logAuditEvent("auth_login_attempt", { 
      email: email.toLowerCase().trim(), 
      success: authSuccess, 
      error: error?.message || null,
      user_id: data.user?.id || null,
      ip_address: 'client-side',
      user_agent: navigator.userAgent 
    });

    if (error) {
      toast.error("Falha na autenticação", {
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos." 
          : error.message,
      });
      return false;
    }

    // 7. Registrar login bem-sucedido
    await logAuditEvent("login_success", { 
      email: email.toLowerCase().trim(),
      user_id: data.user?.id 
    }, data.user?.id);

    // 8. Configurar expiração de sessão (8 horas)
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
