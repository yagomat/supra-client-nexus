
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
  const { user } = useAuth();
  
  // Gerar novo token quando a sessão muda
  useEffect(() => {
    const token = generateCSRFToken(user?.id);
    setCSRFToken(token);
  }, [user?.id]);
  
  // Validar requisição antes de enviar
  const validateRequest = useCallback((options: {
    origin?: string;
    referer?: string;
    token?: string;
  } = {}): boolean => {
    // Verificar origem da requisição
    const origin = options.origin || window.location.origin;
    const referer = options.referer || document.referrer;
    
    if (!validateCSRFToken(origin, referer)) {
      console.warn('CSRF: Origem da requisição inválida');
      return false;
    }
    
    // Verificar se é uma requisição da mesma origem
    if (!isSameOriginRequest()) {
      console.warn('CSRF: Requisição de origem cruzada detectada');
      return false;
    }
    
    // Validar token se fornecido
    if (options.token && !validateCSRFTokenData(options.token, user?.id)) {
      console.warn('CSRF: Token inválido ou expirado');
      return false;
    }
    
    return true;
  }, [user?.id]);
  
  // Obter headers seguros com token CSRF
  const getSecureHeaders = useCallback((): HeadersInit => {
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest', // Indica que é uma requisição AJAX
      'Origin': window.location.origin
    };
  }, [csrfToken]);
  
  return {
    csrfToken,
    validateRequest,
    getSecureHeaders,
    isValidOrigin: isSameOriginRequest()
  };
};
