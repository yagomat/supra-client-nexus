
/**
 * Utilitários de segurança - SIMPLIFICADO
 * A maioria das funcionalidades foram movidas para o backend por segurança
 */

/**
 * @deprecated - Moved to backend for security
 */
export const sanitizeForHTML = (input: string | null | undefined): string => {
  console.warn('sanitizeForHTML is deprecated. Use backend sanitization.');
  return input || '';
};

/**
 * @deprecated - Moved to backend for security  
 */
export const validateInputSafety = (input: string): boolean => {
  console.warn('validateInputSafety is deprecated. Use backend validation.');
  return true;
};

/**
 * @deprecated - Moved to secure Edge Function
 */
export const generateCSRFToken = (): string => {
  console.warn('generateCSRFToken is deprecated. Use SecureCSRFManager instead.');
  return 'deprecated-token';
};

/**
 * @deprecated - Moved to secure Edge Function
 */
export const validateCSRFToken = (): boolean => {
  console.warn('validateCSRFToken is deprecated. Use SecureCSRFManager instead.');
  return true;
};

/**
 * Headers seguros básicos - mantidos para compatibilidade
 */
export const getSecureHeaders = (csrfToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
};

/**
 * Verificação básica de origem - mantida para compatibilidade
 */
export const isSameOriginRequest = (): boolean => {
  if (typeof window === 'undefined') {
    return true;
  }
  
  const currentOrigin = window.location.origin;
  const allowedOrigins = [
    currentOrigin,
    'https://lovable.dev',
    'https://tmgofvlwnbsikvyaavgr.supabase.co'
  ];
  
  return allowedOrigins.includes(currentOrigin);
};
