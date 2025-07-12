
import { useMemo } from 'react';
import { sanitizeHtml, sanitizeText, sanitizeFormInput, containsDangerousContent } from '@/utils/xssSanitizer';

interface UseSafeRenderOptions {
  /** Se true, permite tags HTML básicas */
  allowBasicHtml?: boolean;
  /** Se true, registra tentativas de XSS */
  logAttempts?: boolean;
}

/**
 * Hook para sanitização segura de dados antes da renderização
 */
export const useSafeRender = (
  data: string | null | undefined,
  options: UseSafeRenderOptions = {}
) => {
  const { allowBasicHtml = false, logAttempts = true } = options;

  const sanitizedData = useMemo(() => {
    if (!data) return '';

    // Log tentativas de XSS se habilitado
    if (logAttempts && containsDangerousContent(data)) {
      console.warn('Tentativa de XSS detectada e bloqueada:', {
        originalContent: data.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });
    }

    return allowBasicHtml ? sanitizeHtml(data) : sanitizeText(data);
  }, [data, allowBasicHtml, logAttempts]);

  return sanitizedData;
};

/**
 * Hook para sanitização de dados de formulário
 */
export const useSafeFormData = (data: Record<string, any>) => {
  return useMemo(() => {
    const sanitizedData: Record<string, any> = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeFormInput(value);
      } else {
        sanitizedData[key] = value;
      }
    });
    
    return sanitizedData;
  }, [data]);
};
