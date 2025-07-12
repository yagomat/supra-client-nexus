
/**
 * Sistema de logging seguro que previne exposição de dados sensíveis
 */

// Tipos para níveis de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interface para configuração de logging
interface LogConfig {
  level: LogLevel;
  enabledInProduction: boolean;
  maskSensitiveData: boolean;
  enableContextualLogging: boolean;
}

// Configuração baseada no ambiente
const getLogConfig = (): LogConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    level: isDevelopment ? 'debug' : 'error',
    enabledInProduction: false, // Produção só permite logs de erro crítico
    maskSensitiveData: true,
    enableContextualLogging: isDevelopment
  };
};

// Lista de campos considerados sensíveis
const SENSITIVE_FIELDS = [
  'nome', 'name', 'email', 'telefone', 'phone', 'cpf', 'cnpj',
  'senha', 'password', 'token', 'key', 'id', 'cliente_id', 'user_id',
  'valor', 'amount', 'preco', 'price', 'pagamento', 'payment',
  'servidor', 'aplicativo', 'usuario_aplicativo', 'senha_aplicativo'
];

// Função para mascarar strings sensíveis
const maskSensitiveString = (value: string, fieldName?: string): string => {
  if (!value || typeof value !== 'string') return '[MASKED]';
  
  // Se é um ID (UUID), mostrar apenas primeiros 8 caracteres
  if (fieldName?.includes('id') || value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return `${value.substring(0, 8)}...`;
  }
  
  // Para nomes, mostrar apenas primeira letra
  if (fieldName?.includes('nome') || fieldName?.includes('name')) {
    return `${value.charAt(0)}***`;
  }
  
  // Para outros dados sensíveis, mascarar completamente
  return '[MASKED]';
};

// Função para mascarar objetos recursivamente
const maskSensitiveData = (data: any): any => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return '[MASKED_STRING]';
  }
  
  if (typeof data === 'number') {
    return '[MASKED_NUMBER]';
  }
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }
  
  if (typeof data === 'object') {
    const masked: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const keyLower = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some(field => keyLower.includes(field));
      
      if (isSensitive) {
        if (typeof value === 'string') {
          masked[key] = maskSensitiveString(value, keyLower);
        } else {
          masked[key] = '[MASKED]';
        }
      } else if (typeof value === 'object') {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    
    return masked;
  }
  
  return data;
};

// Função principal de logging seguro
export const secureLog = {
  debug: (message: string, data?: any) => {
    log('debug', message, data);
  },
  
  info: (message: string, data?: any) => {
    log('info', message, data);
  },
  
  warn: (message: string, data?: any) => {
    log('warn', message, data);
  },
  
  error: (message: string, data?: any) => {
    log('error', message, data);
  },
  
  // Função especial para logging de operações de cliente (sempre mascarado)
  clientOperation: (operation: string, context?: any) => {
    const config = getLogConfig();
    if (!shouldLog('info', config)) return;
    
    const maskedContext = config.maskSensitiveData ? maskSensitiveData(context) : context;
    console.info(`[CLIENT_OP] ${operation}`, maskedContext);
  },
  
  // Função para debugging apenas em desenvolvimento
  devOnly: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] ${message}`, data);
    }
  },

  // Logs críticos que sempre aparecem (mesmo em produção)
  critical: (message: string, data?: any) => {
    const processedData = maskSensitiveData(data);
    console.error(`[CRITICAL] ${message}`, processedData);
  }
};

// Função interna de logging
const log = (level: LogLevel, message: string, data?: any) => {
  const config = getLogConfig();
  
  if (!shouldLog(level, config)) return;
  
  const processedData = config.maskSensitiveData && data ? maskSensitiveData(data) : data;
  
  const logMessage = `[${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'debug':
      console.debug(logMessage, processedData);
      break;
    case 'info':
      console.info(logMessage, processedData);
      break;
    case 'warn':
      console.warn(logMessage, processedData);
      break;
    case 'error':
      console.error(logMessage, processedData);
      break;
  }
};

// Função para verificar se deve logar baseado no nível e configuração
const shouldLog = (level: LogLevel, config: LogConfig): boolean => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Em produção, só permitir logs críticos
  if (isProduction && !config.enabledInProduction) {
    return level === 'error';
  }
  
  // Verificar nível mínimo
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  return levels[level] >= levels[config.level];
};

// Função para logging de performance (sem dados sensíveis)
export const logPerformance = (operation: string, duration: number) => {
  secureLog.info(`Performance: ${operation}`, { duration_ms: duration });
};

// Função para logging de erros estruturado
export const logError = (error: Error, context: string, additionalInfo?: Record<string, any>) => {
  const errorInfo = {
    context,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    additionalInfo: additionalInfo ? maskSensitiveData(additionalInfo) : undefined
  };
  
  secureLog.error('Application Error', errorInfo);
};

// Função para substituir console.log inseguros (para migração gradual)
export const replaceUnsafeLogs = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {}; // Desabilitar console.log em produção
    console.info = () => {}; // Desabilitar console.info em produção
    console.warn = (message: string, ...args: any[]) => {
      secureLog.warn(message, args);
    };
    // Manter console.error para erros críticos
  }
};
