
// Contador para tentativas de login
const loginAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

// Função para verificar rate limiting
export const checkRateLimit = (email: string): boolean => {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (attempt) {
    // Verifica se o tempo de bloqueio passou
    if (now - attempt.timestamp > LOCKOUT_TIME) {
      loginAttempts.set(email, { count: 1, timestamp: now });
      return true;
    }

    // Verifica se excedeu o número máximo de tentativas
    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      return false;
    }

    // Incrementa o contador de tentativas
    loginAttempts.set(email, { count: attempt.count + 1, timestamp: attempt.timestamp });
  } else {
    loginAttempts.set(email, { count: 1, timestamp: now });
  }

  return true;
};

// Função para limpar tentativas de login
export const clearLoginAttempts = (email: string): void => {
  loginAttempts.delete(email);
};
