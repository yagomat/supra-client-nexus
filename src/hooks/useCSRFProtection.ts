
import { useState, useEffect, useCallback } from 'react';

export const useCSRFProtection = () => {
  const [csrfToken] = useState(() => {
    // Gerar token CSRF simples baseado em timestamp
    return btoa(`${Date.now()}-${Math.random()}`);
  });
  
  const [isValidOrigin, setIsValidOrigin] = useState(true);

  // Lista de origens válidas (incluindo Lovable)
  const validOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    window.location.origin,
    'https://lovable.dev',
    'https://id-preview--571771e6-b817-4602-a697-0499691ad4b3.lovable.app'
  ];

  // Verificar origem válida de forma mais flexível
  const checkOrigin = useCallback(() => {
    const currentOrigin = window.location.origin;
    const referrer = document.referrer;
    
    // Aceitar se for uma das origens válidas ou se for um domínio Lovable
    const isValid = validOrigins.includes(currentOrigin) || 
                   currentOrigin.includes('.lovable.app') ||
                   referrer.includes('lovable.dev') ||
                   referrer === '';

    setIsValidOrigin(isValid);
    
    if (!isValid) {
      console.warn('CSRF: Origem não reconhecida:', {
        currentOrigin,
        referrer,
        timestamp: new Date().toISOString()
      });
    }
    
    return isValid;
  }, []);

  useEffect(() => {
    checkOrigin();
  }, [checkOrigin]);

  const validateRequest = useCallback(() => {
    return checkOrigin();
  }, [checkOrigin]);

  // Adicionar função getSecureHeaders que estava faltando
  const getSecureHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': window.location.origin
    };
  }, [csrfToken]);

  return {
    csrfToken,
    isValidOrigin,
    validateRequest,
    getSecureHeaders
  };
};
