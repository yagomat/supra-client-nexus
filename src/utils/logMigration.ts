
/**
 * Utilitário para migrar logs inseguros para o sistema seguro
 */

import { secureLog } from "./secureLogger";

// Lista de padrões inseguros comuns
const UNSAFE_PATTERNS = [
  /console\.log\(/g,
  /console\.info\(/g,
  /console\.warn\(/g,
  /console\.debug\(/g
];

// Função para detectar logs inseguros em tempo de execução (desenvolvimento)
export const detectUnsafeLogs = () => {
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;
    
    console.log = (...args: any[]) => {
      secureLog.warn('UNSAFE LOG DETECTED - Use secureLog instead', { args: args.slice(0, 2) });
      originalConsoleLog.apply(console, args);
    };
    
    console.info = (...args: any[]) => {
      secureLog.warn('UNSAFE INFO LOG DETECTED - Use secureLog instead', { args: args.slice(0, 2) });
      originalConsoleInfo.apply(console, args);
    };
  }
};

// Função para configurar alertas de logs em produção
export const setupProductionLogAlerts = () => {
  if (process.env.NODE_ENV === 'production') {
    // Capturar erros não tratados
    window.addEventListener('error', (event) => {
      secureLog.critical('Uncaught Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.message
      });
    });

    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      secureLog.critical('Unhandled Promise Rejection', {
        reason: event.reason?.message || 'Unknown reason'
      });
    });
  }
};

// Função para substituir logs específicos por contexto
export const migrateContextualLogs = () => {
  // Esta função seria usada para migrar logs específicos
  // em arquivos que ainda não foram atualizados
  secureLog.info('Log migration system initialized');
};
