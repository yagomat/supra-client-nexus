
/**
 * Utilitários para aplicar headers de segurança no lado do cliente
 */

export interface SecurityHeadersConfig {
  environment?: 'development' | 'production';
  enableCSP?: boolean;
  enableHSTS?: boolean;
  customCSP?: string;
}

/**
 * Headers de segurança essenciais
 */
export const getSecurityHeaders = (config: SecurityHeadersConfig = {}) => {
  const {
    environment = 'development',
    enableCSP = true,
    enableHSTS = true,
    customCSP
  } = config;

  const headers: Record<string, string> = {};

  // Content Security Policy
  if (enableCSP) {
    if (customCSP) {
      headers['Content-Security-Policy'] = customCSP;
    } else if (environment === 'production') {
      headers['Content-Security-Policy'] = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
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
    } else {
      headers['Content-Security-Policy'] = [
        "default-src 'self'",
        "script-src 'self' https://cdn.gpteng.co 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://tmgofvlwnbsikvyaavgr.supabase.co wss://tmgofvlwnbsikvyaavgr.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ');
    }
  }

  // X-Frame-Options
  headers['X-Frame-Options'] = 'DENY';

  // Strict-Transport-Security (apenas em HTTPS)
  if (enableHSTS && (window.location.protocol === 'https:' || environment === 'production')) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  // X-Content-Type-Options
  headers['X-Content-Type-Options'] = 'nosniff';

  // X-XSS-Protection
  headers['X-XSS-Protection'] = '1; mode=block';

  // Referrer-Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  // Permissions-Policy
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=()';

  // Cross-Origin Policies
  headers['Cross-Origin-Embedder-Policy'] = 'credentialless';
  headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  headers['Cross-Origin-Resource-Policy'] = 'cross-origin';

  return headers;
};

/**
 * Aplica headers de segurança através de meta tags (fallback)
 */
export const applySecurityHeadersViaMeta = (config: SecurityHeadersConfig = {}) => {
  const headers = getSecurityHeaders(config);
  const head = document.head;

  // Remover meta tags existentes de segurança
  const existingTags = head.querySelectorAll('meta[http-equiv^="Content-Security"], meta[http-equiv^="X-"], meta[http-equiv^="Strict-"]');
  existingTags.forEach(tag => tag.remove());

  // Adicionar novos meta tags
  Object.entries(headers).forEach(([name, value]) => {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', name);
    meta.setAttribute('content', value);
    head.appendChild(meta);
  });

  console.log('✅ Headers de segurança aplicados via meta tags:', Object.keys(headers));
};

/**
 * Verifica se os headers de segurança estão presentes
 */
export const checkSecurityHeaders = async (): Promise<{
  present: string[];
  missing: string[];
  warnings: string[];
}> => {
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'Strict-Transport-Security',
    'X-Content-Type-Options'
  ];

  const present: string[] = [];
  const missing: string[] = [];
  const warnings: string[] = [];

  try {
    // Verificar através de uma requisição HEAD
    const response = await fetch(window.location.href, { method: 'HEAD' });
    
    requiredHeaders.forEach(header => {
      if (response.headers.get(header)) {
        present.push(header);
      } else {
        missing.push(header);
      }
    });

    // Verificações específicas
    if (!response.headers.get('Strict-Transport-Security') && window.location.protocol === 'https:') {
      warnings.push('HSTS não configurado em conexão HTTPS');
    }

    if (response.headers.get('Content-Security-Policy')?.includes('unsafe-inline')) {
      warnings.push('CSP permite scripts inline (pode ser vulnerável)');
    }

  } catch (error) {
    console.error('Erro ao verificar headers de segurança:', error);
    missing.push(...requiredHeaders);
  }

  return { present, missing, warnings };
};

/**
 * Monitora e reporta problemas de segurança
 */
export const monitorSecurityHeaders = () => {
  // Verificar CSP violations
  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('🚨 Violação de CSP detectada:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      lineNumber: event.lineNumber
    });
  });

  // Verificar headers na inicialização
  checkSecurityHeaders().then(({ present, missing, warnings }) => {
    if (missing.length > 0) {
      console.warn('⚠️ Headers de segurança ausentes:', missing);
    }
    if (warnings.length > 0) {
      console.warn('⚠️ Avisos de segurança:', warnings);
    }
    if (present.length > 0) {
      console.log('✅ Headers de segurança presentes:', present);
    }
  });
};
