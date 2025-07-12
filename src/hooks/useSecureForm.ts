
import { useState, useCallback, useEffect } from 'react';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { useToast } from '@/components/ui/use-toast';

interface SecureFormOptions {
  onSecurityFail?: () => void;
  validateOnChange?: boolean;
  enforceRateLimit?: boolean;
  logAttempts?: boolean;
}

export const useSecureForm = (options: SecureFormOptions = {}) => {
  const [isSecure, setIsSecure] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const [validationAttempts, setValidationAttempts] = useState(0);
  const { toast } = useToast();
  
  const { 
    validateRequest, 
    getSecureHeaders, 
    csrfToken, 
    isValidOrigin 
  } = useCSRFProtection();

  // Validação inicial
  useEffect(() => {
    const initialValidation = validateRequest();
    setIsSecure(initialValidation && isValidOrigin);
    
    if (!initialValidation || !isValidOrigin) {
      console.warn('useSecureForm: Validação inicial de segurança falhou', {
        validateRequest: initialValidation,
        isValidOrigin,
        csrfToken: !!csrfToken
      });
    }
  }, [validateRequest, isValidOrigin, csrfToken]);

  // Validar formulário antes da submissão
  const validateFormSecurity = useCallback(async (additionalData?: any): Promise<boolean> => {
    const currentTime = new Date();
    setLastValidation(currentTime);
    setValidationAttempts(prev => prev + 1);

    // Rate limiting para tentativas de validação
    if (options.enforceRateLimit && validationAttempts > 10) {
      if (options.logAttempts) {
        console.error('useSecureForm: Muitas tentativas de validação', {
          attempts: validationAttempts,
          timestamp: currentTime.toISOString()
        });
      }
      
      toast({
        title: "Muitas tentativas de segurança",
        description: "Aguarde antes de tentar novamente.",
        variant: "destructive",
      });
      
      return false;
    }

    // Validação CSRF
    const csrfValid = validateRequest({
      token: csrfToken,
      origin: window.location.origin,
      referer: document.referrer
    });

    if (!csrfValid) {
      if (options.logAttempts) {
        console.error('useSecureForm: Validação CSRF falhou', {
          token: !!csrfToken,
          origin: window.location.origin,
          referer: document.referrer,
          additionalData
        });
      }

      toast({
        title: "Erro de segurança",
        description: "Token de segurança inválido. Recarregue a página.",
        variant: "destructive",
      });

      if (options.onSecurityFail) {
        options.onSecurityFail();
      }

      return false;
    }

    // Validação de origem
    if (!isValidOrigin) {
      if (options.logAttempts) {
        console.error('useSecureForm: Origem inválida', {
          currentOrigin: window.location.origin,
          referrer: document.referrer
        });
      }

      toast({
        title: "Origem não autorizada",
        description: "Esta operação não é permitida de origens externas.",
        variant: "destructive",
      });

      return false;
    }

    setIsSecure(true);
    return true;
  }, [
    validateRequest, 
    csrfToken, 
    isValidOrigin, 
    validationAttempts, 
    options,
    toast
  ]);

  // Criar headers seguros para requisições
  const getSecureFormHeaders = useCallback((): HeadersInit => {
    return {
      ...getSecureHeaders(),
      'X-Form-Timestamp': new Date().toISOString(),
      'X-Validation-Attempts': validationAttempts.toString()
    };
  }, [getSecureHeaders, validationAttempts]);

  // Preparar dados do formulário com informações de segurança
  const prepareSecureFormData = useCallback((formData: any) => {
    return {
      ...formData,
      _csrf_token: csrfToken,
      _form_timestamp: new Date().toISOString(),
      _origin: window.location.origin,
      _validation_id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }, [csrfToken]);

  // Reset das tentativas de validação
  const resetValidationAttempts = useCallback(() => {
    setValidationAttempts(0);
    setLastValidation(null);
  }, []);

  return {
    isSecure,
    validateFormSecurity,
    getSecureFormHeaders,
    prepareSecureFormData,
    resetValidationAttempts,
    validationAttempts,
    lastValidation,
    csrfToken
  };
};
