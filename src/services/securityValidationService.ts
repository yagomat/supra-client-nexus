
import { supabase } from "@/integrations/supabase/client";

export interface SecurityValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface InputSanitizationResult {
  sanitized: string;
  original: string;
  changes_made: string[];
  security_issues: string[];
}

/**
 * Serviço centralizado para validação de segurança
 */
export class SecurityValidationService {
  
  /**
   * Valida entrada de dados com verificações rigorosas
   */
  static validateInput(
    input: string, 
    type: 'email' | 'phone' | 'text' | 'password' | 'url',
    maxLength: number = 255
  ): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Verificações básicas
    if (!input || input.length === 0) {
      errors.push('Campo obrigatório não pode estar vazio');
      risk_level = 'high';
    }

    if (input && input.length > maxLength) {
      errors.push(`Campo excede o limite de ${maxLength} caracteres`);
      risk_level = 'medium';
    }

    // Detectar padrões maliciosos
    const maliciousPatterns = [
      { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, name: 'Script injection' },
      { pattern: /javascript:/gi, name: 'JavaScript protocol' },
      { pattern: /on\w+\s*=/gi, name: 'Event handler injection' },
      { pattern: /data:.*base64/gi, name: 'Base64 data URI' },
      { pattern: /vbscript:/gi, name: 'VBScript protocol' },
      { pattern: /file:\/\//gi, name: 'File protocol' },
      { pattern: /\${.*}/g, name: 'Template injection' },
      { pattern: /\{\{.*\}\}/g, name: 'Template expression' },
      { pattern: /(?:union|select|insert|update|delete|drop|create|alter)\s+/gi, name: 'SQL injection attempt' }
    ];

    for (const { pattern, name } of maliciousPatterns) {
      if (pattern.test(input)) {
        errors.push(`Padrão malicioso detectado: ${name}`);
        risk_level = 'critical';
      }
    }

    // Validações específicas por tipo
    switch (type) {
      case 'email':
        if (input && !this.isValidEmail(input)) {
          errors.push('Formato de email inválido');
          risk_level = 'medium';
        }
        break;
      
      case 'phone':
        if (input && !this.isValidPhone(input)) {
          warnings.push('Formato de telefone pode ser inválido');
        }
        break;
      
      case 'password':
        const passwordValidation = this.validatePassword(input);
        errors.push(...passwordValidation.errors);
        warnings.push(...passwordValidation.warnings);
        if (passwordValidation.errors.length > 0) {
          risk_level = 'high';
        }
        break;
      
      case 'url':
        if (input && !this.isValidUrl(input)) {
          errors.push('URL inválida');
          risk_level = 'medium';
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      risk_level
    };
  }

  /**
   * Sanitiza entrada removendo caracteres perigosos
   */
  static sanitizeInput(input: string): InputSanitizationResult {
    const original = input;
    const changes_made: string[] = [];
    const security_issues: string[] = [];
    let sanitized = input;

    // Remover tags HTML
    if (/<[^>]*>/g.test(sanitized)) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      changes_made.push('HTML tags removidas');
      security_issues.push('HTML injection attempt detected');
    }

    // Remover caracteres de controle
    if (/[\x00-\x1F\x7F-\x9F]/g.test(sanitized)) {
      sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      changes_made.push('Caracteres de controle removidos');
      security_issues.push('Control characters detected');
    }

    // Normalizar espaços
    if (/\s{2,}/g.test(sanitized)) {
      sanitized = sanitized.replace(/\s{2,}/g, ' ');
      changes_made.push('Múltiplos espaços normalizados');
    }

    // Trim
    const trimmed = sanitized.trim();
    if (sanitized !== trimmed) {
      sanitized = trimmed;
      changes_made.push('Espaços em branco removidos');
    }

    return {
      sanitized,
      original,
      changes_made,
      security_issues
    };
  }

  /**
   * Verifica rate limiting avançado
   */
  static async checkAdvancedRateLimit(
    operation: string,
    identifier: string,
    limits: {
      perMinute?: number;
      perHour?: number;
      perDay?: number;
    }
  ): Promise<{
    allowed: boolean;
    limit_type?: string;
    reset_time?: Date;
    current_count?: number;
  }> {
    try {
      // Verificar limites por minuto
      if (limits.perMinute) {
        const { data: currentUser } = await supabase.auth.getUser();
        const allowed = await supabase.rpc('check_rate_limit', {
          p_user_id: currentUser.user?.id,
          p_operation: `${operation}_minute`,
          p_max_requests: limits.perMinute,
          p_time_window_minutes: 1
        });

        if (!allowed.data) {
          return {
            allowed: false,
            limit_type: 'per_minute',
            reset_time: new Date(Date.now() + 60 * 1000),
            current_count: limits.perMinute
          };
        }
      }

      // Verificar limites por hora
      if (limits.perHour) {
        const { data: currentUser } = await supabase.auth.getUser();
        const allowed = await supabase.rpc('check_rate_limit', {
          p_user_id: currentUser.user?.id,
          p_operation: `${operation}_hour`,
          p_max_requests: limits.perHour,
          p_time_window_minutes: 60
        });

        if (!allowed.data) {
          return {
            allowed: false,
            limit_type: 'per_hour',
            reset_time: new Date(Date.now() + 60 * 60 * 1000)
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Erro na verificação de rate limit:', error);
      // Em caso de erro, permitir mas registrar
      return { allowed: true };
    }
  }

  /**
   * Registra evento de segurança para auditoria
   */
  static async logSecurityEvent(
    event_type: string,
    details: {
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      ip_address?: string;
      user_agent?: string;
      additional_data?: any;
    }
  ): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      await supabase.rpc('log_audit_event', {
        p_user_id: currentUser.user?.id || null,
        p_event_type: `security_${event_type}`,
        p_details: {
          ...details,
          timestamp: new Date().toISOString(),
          source: 'security_validation_service'
        }
      });
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
    }
  }

  // Métodos auxiliares privados
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  private static validatePassword(password: string): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[A-Z]/.test(password)) {
      warnings.push('Recomendado: incluir pelo menos uma letra maiúscula');
    }

    if (!/[0-9]/.test(password)) {
      warnings.push('Recomendado: incluir pelo menos um número');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      warnings.push('Recomendado: incluir pelo menos um caractere especial');
    }

    // Verificar padrões comuns fracos
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'admin'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Senha contém padrões muito comuns');
    }

    return { errors, warnings };
  }
}
