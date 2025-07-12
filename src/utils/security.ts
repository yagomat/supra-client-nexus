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
 * Validação CSRF melhorada - Verificar se a requisição é originária de domínios permitidos
 */
export const validateCSRFToken = (origin: string, referer: string): boolean => {
  const allowedOrigins = [
    window.location.origin,
    'https://tmgofvlwnbsikvyaavgr.supabase.co',
    'https://lovable.dev'
  ];
  
  // Log para auditoria
  console.log('CSRF Token Validation:', {
    origin,
    referer,
    allowedOrigins,
    currentOrigin: window.location.origin
  });
  
  // Verificação rigorosa de Origin
  if (origin) {
    const isOriginAllowed = allowedOrigins.includes(origin);
    if (!isOriginAllowed) {
      console.error('CSRF: Origin não permitido:', origin);
      return false;
    }
  }
  
  // Verificação rigorosa de Referer como fallback
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const isRefererAllowed = allowedOrigins.includes(refererUrl.origin);
      
      if (!isRefererAllowed) {
        console.error('CSRF: Referer não permitido:', refererUrl.origin);
        return false;
      }
    } catch (error) {
      console.error('CSRF: Erro ao parsear Referer URL:', error);
      return false;
    }
  }
  
  // Se não há Origin nem Referer, considerar suspeito
  if (!origin && !referer) {
    console.warn('CSRF: Requisição sem Origin ou Referer - suspeita');
    return false;
  }
  
  return true;
};

/**
 * Gerar token CSRF com informações de segurança adicionais
 */
export const generateCSRFToken = (userSession?: string): string => {
  const timestamp = Date.now().toString();
  const sessionId = userSession || 'anonymous';
  const random = generateSecureToken().substring(0, 16);
  const origin = window.location.origin;
  
  // Criar hash com mais informações de contexto
  const tokenData = `${timestamp}-${sessionId}-${random}-${btoa(origin)}`;
  const token = btoa(tokenData).replace(/[+/=]/g, '');
  
  console.log('CSRF Token Generated:', {
    hasSession: !!userSession,
    timestamp: new Date(parseInt(timestamp)).toISOString(),
    origin,
    tokenLength: token.length
  });
  
  return token;
};

/**
 * Validar token CSRF com verificações mais rigorosas
 */
export const validateCSRFTokenData = (token: string, userSession?: string, maxAge: number = 3600000): boolean => {
  if (!token) {
    console.error('CSRF: Token não fornecido');
    return false;
  }
  
  try {
    const decoded = atob(token);
    const parts = decoded.split('-');
    
    if (parts.length < 4) {
      console.error('CSRF: Token com formato inválido');
      return false;
    }
    
    const [timestamp, sessionId, random, encodedOrigin] = parts;
    
    // Verificar se o token não expirou
    const tokenTime = parseInt(timestamp);
    if (isNaN(tokenTime)) {
      console.error('CSRF: Timestamp inválido no token');
      return false;
    }
    
    if (Date.now() - tokenTime > maxAge) {
      console.error('CSRF: Token expirado', {
        tokenAge: Date.now() - tokenTime,
        maxAge
      });
      return false;
    }
    
    // Verificar se a sessão bate
    const expectedSession = userSession || 'anonymous';
    if (sessionId !== expectedSession) {
      console.error('CSRF: Sessão do token não confere');
      return false;
    }
    
    // Verificar origem se disponível
    if (encodedOrigin) {
      try {
        const tokenOrigin = atob(encodedOrigin);
        if (tokenOrigin !== window.location.origin) {
          console.error('CSRF: Origem do token não confere', {
            tokenOrigin,
            currentOrigin: window.location.origin
          });
          return false;
        }
      } catch (error) {
        console.error('CSRF: Erro ao decodificar origem do token');
        return false;
      }
    }
    
    console.log('CSRF: Token validado com sucesso');
    return true;
  } catch (error) {
    console.error('CSRF: Erro ao validar token:', error);
    return false;
  }
};

/**
 * Headers seguros para requisições - Agora integrado com os novos headers de segurança
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
 * Verificar se a requisição é segura com logs detalhados
 */
export const isSameOriginRequest = (): boolean => {
  if (typeof window === 'undefined') {
    return true; // Server-side sempre permitir
  }
  
  const currentOrigin = window.location.origin;
  const documentReferrer = document.referrer;
  
  console.log('Same Origin Check:', {
    currentOrigin,
    documentReferrer,
    hasReferrer: !!documentReferrer
  });
  
  // Se não há referrer, considerar válido (navegação direta)
  if (!documentReferrer) {
    console.log('Same Origin: Navegação direta (sem referrer)');
    return true;
  }
  
  try {
    const referrerUrl = new URL(documentReferrer);
    const allowedOrigins = [
      currentOrigin,
      'https://lovable.dev',
      'https://tmgofvlwnbsikvyaavgr.supabase.co'
    ];
    
    const isAllowed = allowedOrigins.includes(referrerUrl.origin);
    
    console.log('Same Origin Result:', {
      referrerOrigin: referrerUrl.origin,
      allowedOrigins,
      isAllowed
    });
    
    return isAllowed;
  } catch (error) {
    console.error('Same Origin: Erro ao parsear referrer:', error);
    return false;
  }
};

/**
 * Aplicar todas as medidas de segurança de uma vez
 */
export const applySecurityMeasures = () => {
  // Aplicar headers via JavaScript (fallback se o servidor não aplicar)
  if (typeof document !== 'undefined') {
    // Aplicar CSP via meta tag se não estiver presente
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const csp = document.createElement('meta');
      csp.setAttribute('http-equiv', 'Content-Security-Policy');
      csp.setAttribute('content', getProductionCSPString());
      document.head.appendChild(csp);
    }
    
    // Monitorar violações de CSP
    document.addEventListener('securitypolicyviolation', (event) => {
      console.warn('🚨 Violação de CSP:', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        disposition: event.disposition
      });
    });
  }
};

/**
 * CSP otimizado baseado no ambiente
 */
export const getDynamicCSPString = (environment: 'development' | 'production' = 'development'): string => {
  const baseDirectives = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://tmgofvlwnbsikvyaavgr.supabase.co wss://tmgofvlwnbsikvyaavgr.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];

  if (environment === 'production') {
    return [
      ...baseDirectives,
      "script-src 'self'",
      "style-src 'self'",
      "block-all-mixed-content"
    ].join('; ');
  } else {
    return [
      ...baseDirectives,
      "script-src 'self' https://cdn.gpteng.co 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'"
    ].join('; ');
  }
};

/**
 * Content Security Policy mais restritiva e segura
 */
export const getCSPString = (): string => {
  return getDynamicCSPString('development');
};

/**
 * CSP mais restritivo para produção
 */
export const getProductionCSPString = (): string => {
  return getDynamicCSPString('production');
};
