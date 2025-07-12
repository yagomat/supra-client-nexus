
import { secureLog } from "./secureLogger";

/**
 * Logger contextual para diferentes partes da aplicação
 */

// Contextos específicos da aplicação
export const clienteLogger = {
  operacao: (operacao: string, detalhes?: any) => {
    secureLog.clientOperation(`Cliente ${operacao}`, detalhes);
  },
  
  erro: (erro: string, contexto?: any) => {
    secureLog.error(`Cliente Error: ${erro}`, contexto);
  },
  
  info: (info: string, dados?: any) => {
    secureLog.devOnly(`Cliente Info: ${info}`, dados);
  }
};

export const pagamentoLogger = {
  operacao: (operacao: string, detalhes?: any) => {
    secureLog.clientOperation(`Pagamento ${operacao}`, detalhes);
  },
  
  erro: (erro: string, contexto?: any) => {
    secureLog.error(`Pagamento Error: ${erro}`, contexto);
  },
  
  info: (info: string, dados?: any) => {
    secureLog.devOnly(`Pagamento Info: ${info}`, dados);
  }
};

export const authLogger = {
  tentativa: (tipo: string, email?: string) => {
    secureLog.info(`Auth ${tipo}`, { email: email ? `${email.charAt(0)}***` : '[MASKED]' });
  },
  
  sucesso: (tipo: string, userId?: string) => {
    secureLog.info(`Auth Success: ${tipo}`, { userId: userId ? `${userId.substring(0, 8)}...` : '[MASKED]' });
  },
  
  erro: (tipo: string, erro: string) => {
    secureLog.error(`Auth Error: ${tipo}`, { error: erro });
  }
};

export const securityLogger = {
  suspeito: (evento: string, detalhes?: any) => {
    secureLog.critical(`Security Event: ${evento}`, detalhes);
  },
  
  csrf: (evento: string, detalhes?: any) => {
    secureLog.critical(`CSRF Event: ${evento}`, detalhes);
  },
  
  rateLimit: (operacao: string, detalhes?: any) => {
    secureLog.warn(`Rate Limit: ${operacao}`, detalhes);
  }
};

export const performanceLogger = {
  lento: (operacao: string, duracao: number) => {
    if (duracao > 1000) { // Apenas logs de operações que demoram mais de 1s
      secureLog.warn(`Slow Operation: ${operacao}`, { duration_ms: duracao });
    }
  },
  
  erro: (operacao: string, erro: string) => {
    secureLog.error(`Performance Error: ${operacao}`, { error: erro });
  }
};
