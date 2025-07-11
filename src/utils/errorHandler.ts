/**
 * Tratamento seguro de erros para prevenir vazamento de informações sensíveis
 */

export interface SafeError {
  message: string;
  code?: string;
  timestamp: string;
}

/**
 * Sanitiza erros para exposição segura ao usuário
 */
export const sanitizeError = (error: any): SafeError => {
  const timestamp = new Date().toISOString();
  
  // Se for um erro conhecido do Supabase
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    // Mapear erros comuns para mensagens amigáveis
    if (message.includes('invalid input') || message.includes('validation')) {
      return {
        message: 'Os dados fornecidos são inválidos. Verifique e tente novamente.',
        code: 'VALIDATION_ERROR',
        timestamp
      };
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return {
        message: 'Você não tem permissão para realizar esta operação.',
        code: 'PERMISSION_ERROR',
        timestamp
      };
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return {
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        code: 'NETWORK_ERROR',
        timestamp
      };
    }
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        code: 'RATE_LIMIT_ERROR',
        timestamp
      };
    }
    
    if (message.includes('duplicate') || message.includes('already exists')) {
      return {
        message: 'Este registro já existe no sistema.',
        code: 'DUPLICATE_ERROR',
        timestamp
      };
    }
    
    if (message.includes('not found')) {
      return {
        message: 'Registro não encontrado.',
        code: 'NOT_FOUND_ERROR',
        timestamp
      };
    }
  }
  
  // Para erros não mapeados, usar mensagem genérica
  return {
    message: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.',
    code: 'UNKNOWN_ERROR',
    timestamp
  };
};

/**
 * Log seguro de erros (sem informações sensíveis)
 */
export const logError = (error: any, context?: string): void => {
  const safeError = sanitizeError(error);
  
  // Em desenvolvimento, pode logar mais detalhes
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      context,
      error: safeError,
      originalError: error?.message || error
    });
  } else {
    // Em produção, log mínimo
    console.error('Application error:', {
      context,
      code: safeError.code,
      timestamp: safeError.timestamp
    });
  }
};

/**
 * Wrapper para operações que podem falhar
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: SafeError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const safeError = sanitizeError(error);
    logError(error, context);
    return { error: safeError };
  }
};

/**
 * Valida se um erro é seguro para exibir ao usuário
 */
export const isUserSafeError = (error: any): boolean => {
  if (!error?.message) return false;
  
  const message = error.message.toLowerCase();
  const unsafePatterns = [
    'internal server error',
    'database error',
    'sql',
    'postgresql',
    'connection string',
    'password',
    'secret',
    'token',
    'key'
  ];
  
  return !unsafePatterns.some(pattern => message.includes(pattern));
};