
/**
 * Utilitários para segurança de sessão
 */

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  maxInactivityMinutes: number;
  requireReauth: boolean;
}

interface SessionState {
  lastActivity: Date;
  loginTime: Date;
  warnings: number;
  isValid: boolean;
}

export class SessionSecurityManager {
  private static instance: SessionSecurityManager;
  private config: SessionConfig;
  private state: SessionState;
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private onTimeout?: () => void;
  private onWarning?: (minutesLeft: number) => void;

  private constructor() {
    this.config = {
      timeoutMinutes: 480, // 8 horas
      warningMinutes: 30,  // Avisar 30 min antes
      maxInactivityMinutes: 60, // 1 hora de inatividade
      requireReauth: true
    };

    this.state = {
      lastActivity: new Date(),
      loginTime: new Date(),
      warnings: 0,
      isValid: true
    };

    this.setupActivityTracking();
  }

  static getInstance(): SessionSecurityManager {
    if (!SessionSecurityManager.instance) {
      SessionSecurityManager.instance = new SessionSecurityManager();
    }
    return SessionSecurityManager.instance;
  }

  /**
   * Configura callbacks para timeout e avisos
   */
  setCallbacks(
    onTimeout: () => void,
    onWarning?: (minutesLeft: number) => void
  ): void {
    this.onTimeout = onTimeout;
    this.onWarning = onWarning;
    this.startSessionTimer();
  }

  /**
   * Atualiza a atividade do usuário
   */
  updateActivity(): void {
    this.state.lastActivity = new Date();
    
    // Resetar timer se necessário
    if (this.shouldResetTimer()) {
      this.resetSessionTimer();
    }
  }

  /**
   * Verifica se a sessão ainda é válida
   */
  isSessionValid(): boolean {
    const now = new Date();
    const sessionAge = now.getTime() - this.state.loginTime.getTime();
    const inactivityTime = now.getTime() - this.state.lastActivity.getTime();

    // Verificar timeout geral da sessão
    if (sessionAge > this.config.timeoutMinutes * 60 * 1000) {
      this.invalidateSession('session_timeout');
      return false;
    }

    // Verificar inatividade
    if (inactivityTime > this.config.maxInactivityMinutes * 60 * 1000) {
      this.invalidateSession('inactivity_timeout');
      return false;
    }

    return this.state.isValid;
  }

  /**
   * Obtém tempo restante da sessão em minutos
   */
  getTimeRemaining(): number {
    const now = new Date();
    const sessionAge = now.getTime() - this.state.loginTime.getTime();
    const remainingMs = (this.config.timeoutMinutes * 60 * 1000) - sessionAge;
    return Math.max(0, Math.floor(remainingMs / (60 * 1000)));
  }

  /**
   * Força invalidação da sessão
   */
  invalidateSession(reason: string = 'manual'): void {
    this.state.isValid = false;
    this.clearTimers();
    
    console.log(`Sessão invalidada: ${reason}`);
    
    if (this.onTimeout) {
      this.onTimeout();
    }
  }

  /**
   * Reinicia a sessão (após login)
   */
  resetSession(): void {
    const now = new Date();
    this.state = {
      lastActivity: now,
      loginTime: now,
      warnings: 0,
      isValid: true
    };
    
    this.startSessionTimer();
  }

  /**
   * Obtém estatísticas da sessão
   */
  getSessionStats(): {
    sessionAge: number;
    lastActivity: number;
    timeRemaining: number;
    warnings: number;
    isValid: boolean;
  } {
    const now = new Date();
    return {
      sessionAge: Math.floor((now.getTime() - this.state.loginTime.getTime()) / (60 * 1000)),
      lastActivity: Math.floor((now.getTime() - this.state.lastActivity.getTime()) / (60 * 1000)),
      timeRemaining: this.getTimeRemaining(),
      warnings: this.state.warnings,
      isValid: this.state.isValid
    };
  }

  private setupActivityTracking(): void {
    // Rastrear atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const throttledUpdate = this.throttle(() => {
      this.updateActivity();
    }, 30000); // Throttle para 30 segundos

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, true);
    });

    // Detectar quando a aba fica inativa/ativa
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateActivity();
      }
    });
  }

  private startSessionTimer(): void {
    this.clearTimers();

    // Timer para aviso
    const warningMs = (this.config.timeoutMinutes - this.config.warningMinutes) * 60 * 1000;
    this.warningTimeoutId = setTimeout(() => {
      this.state.warnings++;
      if (this.onWarning) {
        this.onWarning(this.config.warningMinutes);
      }
    }, warningMs);

    // Timer para timeout
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    this.timeoutId = setTimeout(() => {
      this.invalidateSession('session_timeout');
    }, timeoutMs);
  }

  private resetSessionTimer(): void {
    // Só resetar se ainda não deu warning
    if (this.state.warnings === 0) {
      this.startSessionTimer();
    }
  }

  private shouldResetTimer(): boolean {
    // Resetar timer apenas se a sessão ainda é válida e não deu avisos
    return this.state.isValid && this.state.warnings === 0;
  }

  private clearTimers(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  private throttle(func: Function, delay: number): () => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return () => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func();
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func();
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
}

/**
 * Hook para usar o gerenciador de sessão
 */
export const useSessionSecurity = () => {
  const manager = SessionSecurityManager.getInstance();
  
  return {
    isValid: manager.isSessionValid(),
    timeRemaining: manager.getTimeRemaining(),
    stats: manager.getSessionStats(),
    updateActivity: () => manager.updateActivity(),
    invalidate: (reason?: string) => manager.invalidateSession(reason),
    reset: () => manager.resetSession(),
    setCallbacks: (onTimeout: () => void, onWarning?: (minutesLeft: number) => void) => 
      manager.setCallbacks(onTimeout, onWarning)
  };
};
