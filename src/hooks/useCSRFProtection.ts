
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SecureCSRFManager } from '@/services/auth/secureCSRFService';

export const useCSRFProtection = () => {
  const [csrfToken, setCSRFToken] = useState<string>('');
  const [isValidOrigin, setIsValidOrigin] = useState(true);
  
  const { user } = useAuth();
  
  // Gerar token seguro quando necessário
  useEffect(() => {
    const generateToken = async () => {
      if (user) {
        const token = await SecureCSRFManager.getValidToken();
        if (token) {
          setCSRFToken(token);
          console.log('Token CSRF seguro obtido');
        } else {
          console.error('Falha ao obter token CSRF seguro');
        }
      }
    };
    
    generateToken();
  }, [user]);
  
  // Validar requisição usando o serviço seguro
  const validateRequest = useCallback(async (options: {
    origin?: string;
    referer?: string;
    token?: string;
  } = {}): Promise<boolean> => {
    try {
      // Verificar origem básica
      const allowedOrigins = [
        window.location.origin,
        'https://tmgofvlwnbsikvyaavgr.supabase.co',
        'https://lovable.dev'
      ];
      
      const origin = options.origin || window.location.origin;
      if (!allowedOrigins.includes(origin)) {
        console.error('Origem não permitida:', origin);
        return false;
      }
      
      // Validar token CSRF se fornecido ou usar token atual
      const tokenToValidate = options.token || csrfToken;
      if (tokenToValidate) {
        const isValid = await SecureCSRFManager.validateCurrentToken(origin);
        if (!isValid) {
          console.error('Token CSRF inválido');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro na validação de requisição:', error);
      return false;
    }
  }, [csrfToken]);
  
  // Headers seguros simplificados
  const getSecureHeaders = useCallback((): HeadersInit => {
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': window.location.origin,
    };
  }, [csrfToken]);
  
  return {
    csrfToken,
    validateRequest,
    getSecureHeaders,
    isValidOrigin,
    isAuthContextAvailable: !!user,
    authError: null
  };
};
