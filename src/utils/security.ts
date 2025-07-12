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
 * Gera um nonce único para uso em CSP
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

/**
 * Validação CSRF - Verificar se a requisição é originária do nosso domínio
 */
export const validateCSRFToken = (origin: string, referer: string): boolean => {
  const allowedOrigins = [
    window.location.origin,
    'https://tmgofvlwnbsikvyaavgr.supabase.co',
    'https://lovable.dev' // Permitir Lovable como origem válida
  ];
  
  // Verificar se Origin é válido
  if (origin && !allowedOrigins.includes(origin)) {
    return false;
  }
  
  // Verificar se Referer é válido (fallback)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const currentOrigin = window.location.origin;
      
      // Permitir se referer for do mesmo domínio atual ou domínios permitidos
      if (refererUrl.origin === currentOrigin || allowedOrigins.includes(refererUrl.origin)) {
        return true;
      }
    } catch {
      // Se não conseguir parsear a URL do referer, considerar inválido
      return false;
    }
  }
  
  return true;
};

/**
 * Gerar token CSRF baseado na sessão do usuário
 */
export const generateCSRFToken = (userSession?: string): string => {
  const timestamp = Date.now().toString();
  const sessionId = userSession || 'anonymous';
  const random = generateSecureToken().substring(0, 16);
  
  // Criar um hash simples dos componentes
  const tokenData = `${timestamp}-${sessionId}-${random}`;
  return btoa(tokenData).replace(/[+/=]/g, ''); // Remove caracteres especiais
};

/**
 * Validar token CSRF
 */
export const validateCSRFTokenData = (token: string, userSession?: string, maxAge: number = 3600000): boolean => {
  try {
    const decoded = atob(token);
    const [timestamp, sessionId] = decoded.split('-');
    
    // Verificar se o token não expirou (1 hora por padrão)
    const tokenTime = parseInt(timestamp);
    if (Date.now() - tokenTime > maxAge) {
      return false;
    }
    
    // Verificar se a sessão bate
    const expectedSession = userSession || 'anonymous';
    return sessionId === expectedSession;
  } catch {
    return false;
  }
};

/**
 * Headers seguros para requisições
 */
export const getSecureHeaders = (csrfToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  // Adicionar Origin se disponível
  if (typeof window !== 'undefined') {
    headers['Origin'] = window.location.origin;
  }
  
  return headers;
};

/**
 * Verificar se a requisição é segura (mesma origem ou origem permitida)
 */
export const isSameOriginRequest = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const currentOrigin = window.location.origin;
  const documentReferrer = document.referrer;
  
  // Se não há referrer, considerar válido (navegação direta)
  if (!documentReferrer) return true;
  
  try {
    const referrerUrl = new URL(documentReferrer);
    const allowedOrigins = [
      currentOrigin,
      'https://lovable.dev', // Permitir Lovable
      'https://tmgofvlwnbsikvyaavgr.supabase.co'
    ];
    
    // Permitir se referrer for de origem confiável
    return allowedOrigins.includes(referrerUrl.origin);
  } catch {
    return false;
  }
};

/**
 * Content Security Policy mais restritiva e segura
 */
export const getCSPString = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' https://cdn.gpteng.co", // Removido 'unsafe-inline' e 'unsafe-eval'
    "style-src 'self' 'unsafe-inline'", // Mantido apenas para CSS inline do Tailwind
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://tmgofvlwnbsikvyaavgr.supabase.co wss://tmgofvlwnbsikvyaavgr.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

/**
 * CSP mais restritivo para produção
 */
export const getProductionCSPString = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self'", // Sem CDN externo em produção
    "style-src 'self'", // Sem 'unsafe-inline' em produção
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://tmgofvlwnbsikvyaavgr.supabase.co wss://tmgofvlwnbsikvyaavgr.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; ');
};
