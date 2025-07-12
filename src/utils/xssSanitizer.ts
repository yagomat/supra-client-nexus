
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
    .replace(/expression\s*\(/gi, '');

  // Remove todas as tags exceto as permitidas
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      // Remove atributos das tags permitidas por segurança
      return `<${tagName.toLowerCase()}>`;
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
    /data:.*base64/i
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
