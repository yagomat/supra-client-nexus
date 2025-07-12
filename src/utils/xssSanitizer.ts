
/**
 * Utilitário para sanitização XSS - Remove tags perigosas mas preserva formatação básica
 */

// Tags HTML permitidas para formatação básica
const ALLOWED_TAGS = ['b', 'i', 'u', 'strong', 'em', 'br', 'p'];

// Atributos permitidos (vazio por segurança)
const ALLOWED_ATTRIBUTES: string[] = [];

/**
 * Sanitiza string removendo tags HTML perigosas
 */
export const sanitizeHtml = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Verificação inicial de segurança
  if (containsDangerousContent(input)) {
    console.warn('Conteúdo perigoso detectado e bloqueado:', input.substring(0, 50) + '...');
    return sanitizeText(input); // Fallback para texto simples
  }
  
  // Remove scripts e tags perigosas
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<meta\b[^<]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/data:(?!image\/[a-z]+;base64,)[^;,]*/gi, ''); // Permitir apenas imagens base64

  // Remove todas as tags exceto as permitidas
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      // Para tags permitidas, remove todos os atributos por segurança
      const closingTag = match.startsWith('</');
      return closingTag ? `</${tagName.toLowerCase()}>` : `<${tagName.toLowerCase()}>`;
    }
    return '';
  });

  // Remove entidades HTML perigosas
  sanitized = sanitized
    .replace(/&lt;script/gi, '')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#x60;/gi, '`')
    .replace(/&#x3D;/gi, '=');

  // Validação final
  if (containsDangerousContent(sanitized)) {
    console.warn('Conteúdo ainda perigoso após sanitização, usando texto puro');
    return sanitizeText(input);
  }

  return sanitized.trim();
};

/**
 * Sanitiza texto para exibição segura (remove todas as tags HTML)
 */
export const sanitizeText = (input: string | null | undefined): string => {
  if (!input) return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=')
    .trim();
};

/**
 * Valida se uma string contém conteúdo potencialmente perigoso
 */
export const containsDangerousContent = (input: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /<style/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:(?!image\/[a-z]+;base64,)/i, // Bloquear data: exceto imagens base64
    /url\s*\(/i,
    /import\s*[("']/i,
    /@import/i,
    /behavior\s*:/i,
    /binding\s*:/i,
    /moz-binding/i
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitiza entrada de formulário antes do envio
 */
export const sanitizeFormInput = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Para formulários, remove completamente qualquer HTML
  return sanitizeText(input);
};

/**
 * Sanitiza CSS de forma segura
 */
export const sanitizeCSS = (cssContent: string): string => {
  if (!cssContent) return '';
  
  // Remove caracteres e funções perigosas para CSS
  return cssContent
    .replace(/[<>"'&\\]/g, '') // Remove caracteres HTML perigosos
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/expression\s*\(/gi, '') // Remove expression()
    .replace(/@import/gi, '') // Remove @import
    .replace(/url\s*\(/gi, 'url-blocked(') // Bloqueia url()
    .replace(/behavior\s*:/gi, 'behavior-blocked:') // Bloqueia behavior
    .replace(/binding\s*:/gi, 'binding-blocked:') // Bloqueia binding
    .replace(/moz-binding/gi, 'moz-binding-blocked') // Bloqueia moz-binding
    .replace(/eval\s*\(/gi, 'eval-blocked(') // Bloqueia eval
    .replace(/Function\s*\(/gi, 'Function-blocked('); // Bloqueia Function
};

/**
 * Valida se o conteúdo HTML sanitizado é seguro para renderização
 */
export const validateSanitizedContent = (content: string): boolean => {
  if (!content) return true;
  
  // Verifica se ainda há conteúdo perigoso após sanitização
  return !containsDangerousContent(content);
};
