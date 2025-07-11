
import { sanitizeInput } from "./security";

/**
 * Central error handler with security considerations
 */
export const handleError = (error: any, context: string = "Erro desconhecido"): string => {
  // Sanitize the error message to prevent XSS
  const sanitizedContext = sanitizeInput(context);
  
  if (error?.message) {
    const sanitizedMessage = sanitizeInput(error.message);
    console.error(`${sanitizedContext}:`, sanitizedMessage);
    
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
  
  console.error(`${sanitizedContext}:`, error);
  return sanitizedContext;
};

/**
 * Log error securely without exposing sensitive information
 */
export const logSecureError = (error: any, context: string, additionalInfo?: Record<string, any>) => {
  const logData = {
    context: sanitizeInput(context),
    message: error?.message ? sanitizeInput(error.message) : 'Unknown error',
    timestamp: new Date().toISOString(),
    additionalInfo: additionalInfo ? Object.keys(additionalInfo).reduce((acc, key) => {
      acc[key] = sanitizeInput(String(additionalInfo[key]));
      return acc;
    }, {} as Record<string, string>) : undefined
  };
  
  console.error('Secure Error Log:', logData);
};
