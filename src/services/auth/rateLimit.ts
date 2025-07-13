

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
 * Rate limiting desabilitado - sempre permite tentativas
 */
export const checkRateLimit = async (
  identifier: string, // email ou IP
  operation: string,
  maxRequests: number = 999999, // Praticamente ilimitado
  windowMinutes: number = 1
): Promise<RateLimitResult> => {
  // Sempre retornar como permitido
  return {
    allowed: true,
    current_attempts: 0,
    max_attempts: maxRequests,
    window_minutes: windowMinutes,
    remaining_attempts: maxRequests
  };
};

/**
 * Registrar tentativa de autenticação no backend (mantido para auditoria)
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
 * Rate limiting por IP desabilitado - sempre permite
 */
export const checkIPRateLimit = async (
  ipAddress?: string,
  maxRequests: number = 999999, // Praticamente ilimitado
  windowMinutes: number = 1
): Promise<boolean> => {
  // Sempre retornar como permitido
  return true;
};

/**
 * Obter IP do cliente (aproximado)
 */
const getClientIP = (): string => {
  return 'frontend-client';
};

/**
 * Limpar tentativas antigas (função de limpeza)
 */
export const clearLoginAttempts = (email: string): void => {
  secureLog.info('Rate limit clear requested (now disabled)', { email });
};

