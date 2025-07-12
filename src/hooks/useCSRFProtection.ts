
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  generateCSRFToken, 
  validateCSRFTokenData, 
  validateCSRFToken, 
  isSameOriginRequest 
} from '@/utils/security';

export const useCSRFProtection = () => {
  const [csrfToken, setCSRFToken] = useState<string>('');
  const [isAuthContextAvailable, setIsAuthContextAvailable] = useState(false);
  
  // Acessar o contexto de autenticação de forma controlada
  let user = null;
  let authError: Error | null = null;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    setIsAuthContextAvailable(true);
  } catch (error) {
    // Não mascarar o erro - apenas registrar que AuthProvider não está disponível
    authError = error as Error;
    setIsAuthContextAvailable(false);
    console.warn('useCSRFProtection: AuthProvider não disponível:', authError.message);
  }
  
  // Gerar novo token quando a sessão muda
  useEffect(() => {
    const token = generateCSRFToken(user?.id);
    setCSRFToken(token);
    
    // Log para auditoria de geração de tokens
    console.log('CSRF Token gerado:', {
      hasUser: !!user,
      userId: user?.id ? 'present' : 'absent',
      tokenLength: token.length,
      timestamp: new Date().toISOString()
    });
  }, [user?.id]);
  
  // Validar requisição com logs detalhados para debugging
  const validateRequest = useCallback((options: {
    origin?: string;
    referer?: string;
    token?: string;
  } = {}): boolean => {
    const origin = options.origin || window.location.origin;
    const referer = options.referer || document.referrer;
    
    console.log('CSRF Validation iniciada:', {
      origin,
      referer,
      hasToken: !!options.token,
      currentOrigin: window.location.origin
    });
    
    // Verificar origem da requisição com validação rigorosa
    const originValid = validateCSRFToken(origin, referer);
    if (!originValid) {
      console.error('CSRF: Validação de origem falhou', {
        origin,
        referer,
        currentOrigin: window.location.origin,
        reason: 'Invalid origin or referer'
      });
      return false;
    }
    
    // Verificar se é uma requisição da mesma origem
    const sameOrigin = isSameOriginRequest();
    if (!sameOrigin) {
      console.error('CSRF: Requisição de origem cruzada detectada', {
        currentOrigin: window.location.origin,
        referrer: document.referrer,
        reason: 'Cross-origin request detected'
      });
      return false;
    }
    
    // Validar token se fornecido - com validação mais rigorosa
    if (options.token) {
      const tokenValid = validateCSRFTokenData(options.token, user?.id);
      if (!tokenValid) {
        console.error('CSRF: Token inválido ou expirado', {
          tokenProvided: !!options.token,
          hasUser: !!user,
          userId: user?.id ? 'present' : 'absent',
          reason: 'Token validation failed'
        });
        return false;
      }
    }
    
    console.log('CSRF: Validação bem-sucedida');
    return true;
  }, [user?.id]);
  
  // Obter headers seguros com validação adicional
  const getSecureHeaders = useCallback((): HeadersInit => {
    if (!csrfToken) {
      console.warn('CSRF: Token não disponível para headers');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': window.location.origin,
      'X-Timestamp': new Date().toISOString(),
      'X-Auth-Context': isAuthContextAvailable ? 'available' : 'unavailable'
    };
    
    // Adicionar header de validação de origem
    if (document.referrer) {
      headers['Referer'] = document.referrer;
    }
    
    return headers;
  }, [csrfToken, isAuthContextAvailable]);
  
  // Validar estado do CSRF antes de operações críticas
  const validateCSRFState = useCallback((): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!csrfToken) {
      errors.push('Token CSRF não foi gerado');
    }
    
    if (!isAuthContextAvailable && !authError) {
      warnings.push('Contexto de autenticação não disponível');
    }
    
    if (!isSameOriginRequest()) {
      errors.push('Origem da requisição inválida');
    }
    
    // Validar integridade do token atual
    if (csrfToken && !validateCSRFTokenData(csrfToken, user?.id)) {
      errors.push('Token CSRF atual é inválido');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }, [csrfToken, isAuthContextAvailable, authError, user?.id]);
  
  return {
    csrfToken,
    validateRequest,
    getSecureHeaders,
    validateCSRFState,
    isValidOrigin: isSameOriginRequest(),
    isAuthContextAvailable,
    authError: authError?.message || null
  };
};
