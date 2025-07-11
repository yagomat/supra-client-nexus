/**
 * Utilitários de segurança para prevenir ataques XSS e outras vulnerabilidades
 */

/**
 * Sanitiza string para uso seguro em HTML, prevenindo XSS
 */
export const sanitizeForHTML = (input: string | null | undefined): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
};

/**
 * Sanitiza string para uso em URLs, prevenindo injeção
 */
export const sanitizeForURL = (input: string | null | undefined): string => {
  if (!input) return '';
  
  return encodeURIComponent(input);
};

/**
 * Sanitiza string para uso em CSS, prevenindo injeção CSS
 */
export const sanitizeForCSS = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Remove caracteres perigosos para CSS
  return input.replace(/[<>"'&\\]/g, '');
};

/**
 * Valida se uma string contém apenas caracteres alfanuméricos e alguns símbolos seguros
 */
export const isAlphanumericSafe = (input: string): boolean => {
  const safePattern = /^[a-zA-Z0-9\s\-_.@]+$/;
  return safePattern.test(input);
};

/**
 * Gera um token seguro para uso em operações críticas
 */
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Valida se o input não contém padrões maliciosos conhecidos
 */
export const validateInputSafety = (input: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:.*base64/i,
    /vbscript:/i,
    /file:/i,
    /\\x[0-9a-fA-F]{2}/,
    /&#x?[0-9a-fA-F]+;/
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Content Security Policy helper
 */
export const getCSPString = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // React precisa de unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://tmgofvlwnbsikvyaavgr.supabase.co wss://tmgofvlwnbsikvyaavgr.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
};