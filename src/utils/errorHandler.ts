
import { sanitizeForHTML, validateInputSafety } from "./security";
import { secureLog, logError as secureLogError } from "./secureLogger";

/**
 * Simple input sanitization function (alias for sanitizeForHTML)
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  return sanitizeForHTML(input);
};

/**
 * Simple error logging function - now uses secure logging
 */
export const logError = (error: any, context: string = "Erro desconhecido"): void => {
  const sanitizedContext = sanitizeInput(context);
  secureLogError(error, sanitizedContext);
};

/**
 * Central error handler with security considerations
 */
export const handleError = (error: any, context: string = "Erro desconhecido"): string => {
  // Sanitize the error message to prevent XSS
  const sanitizedContext = sanitizeInput(context);
  
  if (error?.message) {
    const sanitizedMessage = sanitizeInput(error.message);
    secureLog.error(`${sanitizedContext}`, { message: sanitizedMessage });
    
    // Return user-friendly error messages
    if (error.message.includes('Rate limit exceeded')) {
      return "Muitas solicitações. Aguarde um momento.";
    }
    
    if (error.message.includes('JWT expired')) {
      return "Sua sessão expirou. Faça login novamente.";
    }
    
    if (error.message.includes('Network')) {
      return "Erro de conexão. Verifique sua internet.";
    }
    
    if (error.message.includes('not authenticated')) {
      return "Acesso negado. Faça login novamente.";
    }
    
    // For other errors, return a generic message to avoid exposing sensitive info
    return sanitizedContext;
  }
  
  secureLog.error(`${sanitizedContext}`, { error: 'Unknown error type' });
  return sanitizedContext;
};

/**
 * Log error securely without exposing sensitive information
 * @deprecated Use secureLog.error or logError from secureLogger instead
 */
export const logSecureError = (error: any, context: string, additionalInfo?: Record<string, any>) => {
  secureLogError(error, context, additionalInfo);
};
