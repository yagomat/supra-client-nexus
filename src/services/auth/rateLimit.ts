
import { supabase } from "@/integrations/supabase/client";
import { secureLog } from "@/utils/secureLogger";

export interface RateLimitResult {
  allowed: boolean;
  current_attempts: number;
  max_attempts: number;
  window_minutes: number;
  next_allowed_at?: string;
  remaining_attempts: number;
}

/**
 * Verificar rate limiting no backend (Supabase)
 * Muito mais seguro que o Map em memória
 */
export const checkRateLimit = async (
  identifier: string, // email ou IP
  operation: string,
  maxRequests: number = 5,
  windowMinutes: number = 15
): Promise<RateLimitResult> => {
  try {
    const { data, error } = await supabase.rpc('check_auth_rate_limit_enhanced', {
      p_identifier: identifier,
      p_operation: operation,
      p_max_requests: maxRequests,
      p_time_window_minutes: windowMinutes
    });

    if (error) {
      secureLog.error('Rate limit check failed', { error: error.message, identifier, operation });
      // Em caso de erro, permitir por segurança (fail-open para não bloquear usuários legítimos)
      return {
        allowed: true,
        current_attempts: 0,
        max_attempts: maxRequests,
        window_minutes: windowMinutes,
        remaining_attempts: maxRequests
      };
    }

    return data as unknown as RateLimitResult;
  } catch (error) {
    secureLog.error('Rate limit check exception', { error, identifier, operation });
    // Em caso de exceção, permitir por segurança
    return {
      allowed: true,
      current_attempts: 0,
      max_attempts: maxRequests,
      window_minutes: windowMinutes,
      remaining_attempts: maxRequests
    };
  }
};

/**
 * Registrar tentativa de autenticação no backend
 */
export const logAuthAttempt = async (
  email: string,
  operation: string,
  success: boolean,
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_auth_attempt_enhanced', {
      p_email: email,
      p_operation: operation,
      p_success: success,
      p_error_message: errorMessage,
      p_ip_address: ipAddress || getClientIP(),
      p_user_agent: userAgent || navigator.userAgent
    });

    if (error) {
      secureLog.error('Failed to log auth attempt', { error: error.message, email, operation });
    }
  } catch (error) {
    secureLog.error('Exception logging auth attempt', { error, email, operation });
  }
};

/**
 * Rate limiting por IP (proteção adicional)
 */
export const checkIPRateLimit = async (
  ipAddress?: string,
  maxRequests: number = 20,
  windowMinutes: number = 5
): Promise<boolean> => {
  try {
    const ip = ipAddress || getClientIP();
    
    const { data, error } = await supabase.rpc('check_ip_rate_limit', {
      p_ip_address: ip,
      p_max_requests: maxRequests,
      p_time_window_minutes: windowMinutes
    });

    if (error) {
      secureLog.error('IP rate limit check failed', { error: error.message, ip });
      return true; // Permitir em caso de erro
    }

    return data as boolean;
  } catch (error) {
    secureLog.error('IP rate limit check exception', { error });
    return true; // Permitir em caso de exceção
  }
};

/**
 * Obter IP do cliente (aproximado)
 * Nota: No frontend, o IP real só pode ser obtido via backend
 */
const getClientIP = (): string => {
  // No frontend, não temos acesso ao IP real
  // Isso deve ser implementado no backend quando possível
  return 'frontend-client';
};

/**
 * Limpar tentativas antigas (função de limpeza)
 * Agora não é mais necessária pois o backend gerencia automaticamente
 */
export const clearLoginAttempts = (email: string): void => {
  secureLog.info('Rate limit clear requested (now handled by backend)', { email });
};
