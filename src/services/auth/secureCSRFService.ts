
import { supabase } from '@/integrations/supabase/client';

export interface CSRFTokenResult {
  success: boolean;
  token?: string;
  expires_at?: string;
  error?: string;
}

export interface CSRFValidationResult {
  success: boolean;
  valid?: boolean;
  error?: string;
}

/**
 * Gera um novo token CSRF usando a Edge Function segura
 */
export async function generateSecureCSRFToken(): Promise<CSRFTokenResult> {
  try {
    console.log('Gerando token CSRF seguro...');
    
    const { data, error } = await supabase.functions.invoke('csrf-token-manager', {
      body: { action: 'generate' }
    });

    if (error) {
      console.error('Erro ao gerar token CSRF:', error);
      return {
        success: false,
        error: error.message || 'Erro ao gerar token CSRF'
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Falha na geração do token'
      };
    }

    console.log('Token CSRF gerado com sucesso');
    
    return {
      success: true,
      token: data.token,
      expires_at: data.expires_at
    };

  } catch (error) {
    console.error('Erro na geração de token CSRF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Valida um token CSRF usando a Edge Function segura
 */
export async function validateSecureCSRFToken(
  token: string, 
  origin?: string
): Promise<CSRFValidationResult> {
  try {
    console.log('Validando token CSRF...');
    
    const { data, error } = await supabase.functions.invoke('csrf-token-manager', {
      body: {
        action: 'validate',
        token,
        origin: origin || window.location.origin
      }
    });

    if (error) {
      console.error('Erro ao validar token CSRF:', error);
      return {
        success: false,
        error: error.message || 'Erro ao validar token CSRF'
      };
    }

    console.log('Validação de token CSRF concluída:', data.valid);
    
    return {
      success: data.success,
      valid: data.valid,
      error: data.error
    };

  } catch (error) {
    console.error('Erro na validação de token CSRF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Hook para gerenciar tokens CSRF de forma segura
 */
export class SecureCSRFManager {
  private static token: string | null = null;
  private static expiresAt: Date | null = null;

  static async getValidToken(): Promise<string | null> {
    // Verificar se token atual ainda é válido
    if (this.token && this.expiresAt && new Date() < this.expiresAt) {
      return this.token;
    }

    // Gerar novo token
    const result = await generateSecureCSRFToken();
    
    if (result.success && result.token) {
      this.token = result.token;
      this.expiresAt = result.expires_at ? new Date(result.expires_at) : null;
      return this.token;
    }

    console.error('Falha ao obter token CSRF válido');
    return null;
  }

  static async validateCurrentToken(origin?: string): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    const result = await validateSecureCSRFToken(this.token, origin);
    return result.success && result.valid === true;
  }

  static clearToken(): void {
    this.token = null;
    this.expiresAt = null;
  }
}
