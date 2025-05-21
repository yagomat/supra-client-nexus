
import DOMPurify from 'dompurify';

// Sanitizar texto para prevenir XSS
export const sanitizeInput = (input: string): string => {
  if (!input) return input;
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: false } });
};

// Sanitizar objeto inteiro
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeInput(item) 
          : (typeof item === 'object' ? sanitizeObject(item) : item)
      );
    }
  });
  
  return result;
};

// Sanitizar corpo de requisição específico para login
export const sanitizeLoginData = (email: string, password: string) => {
  return {
    email: sanitizeInput(email),
    password // Não sanitizar senha pois pode conter caracteres especiais válidos
  };
};

// Sanitizar corpo de requisição específico para cadastro
export const sanitizeSignupData = (email: string, password: string, nome: string) => {
  return {
    email: sanitizeInput(email),
    password, // Não sanitizar senha
    nome: sanitizeInput(nome)
  };
};
