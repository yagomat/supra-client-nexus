/**
 * Sistema de logging centralizado para substituir console.logs
 * Permite controle fino sobre o que é logado em produção
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private isDevelopment = import.meta.env.DEV;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    return `${entry.timestamp} ${levelName} ${context} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString()
    };

    const formattedMessage = this.formatMessage(entry);

    // Em desenvolvimento, sempre logamos no console
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data);
          break;
      }
    }

    // Em produção, apenas erros e warnings importantes
    if (!this.isDevelopment && level <= LogLevel.WARN) {
      console.error(formattedMessage, data);
    }
  }

  error(message: string, context?: string, data?: any) {
    this.log(LogLevel.ERROR, message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // Métodos específicos para diferentes contextos
  payment(message: string, data?: any) {
    this.debug(message, 'PAYMENT', data);
  }

  filter(message: string, data?: any) {
    this.debug(message, 'FILTER', data);
  }

  cliente(message: string, data?: any) {
    this.debug(message, 'CLIENTE', data);
  }

  api(message: string, data?: any) {
    this.debug(message, 'API', data);
  }

  security(message: string, data?: any) {
    this.warn(message, 'SECURITY', data);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Configurar nível baseado no ambiente
if (import.meta.env.DEV) {
  logger.setLogLevel(LogLevel.DEBUG);
} else {
  logger.setLogLevel(LogLevel.WARN);
}