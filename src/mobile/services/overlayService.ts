
export interface OverlayConfig {
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

class OverlayService {
  private config: OverlayConfig = {
    isVisible: false,
    position: { x: 50, y: 100 },
    size: { width: 300, height: 400 }
  };

  private listeners: Array<(config: OverlayConfig) => void> = [];

  async initialize() {
    console.log('Initializing overlay service for Cordova');
    
    // Aguardar o Cordova estar pronto
    if (window.cordova) {
      document.addEventListener('deviceready', () => {
        this.setupOverlay();
      }, false);
    } else {
      // Desenvolvimento - simular overlay
      this.setupOverlay();
    }
  }

  private setupOverlay() {
    console.log('Setting up overlay system for Cordova');
    
    // Se estiver no dispositivo real, verificar permissões
    if (window.cordova && window.device?.platform === 'Android') {
      this.checkOverlayPermissions();
    }
  }

  private async checkOverlayPermissions() {
    // Aqui seria implementada a verificação de permissões específicas do Android
    // Por enquanto, apenas log
    console.log('Checking overlay permissions on Android');
  }

  showOverlay() {
    console.log('Showing overlay');
    this.config.isVisible = true;
    this.notifyListeners();
  }

  hideOverlay() {
    console.log('Hiding overlay');
    this.config.isVisible = false;
    this.notifyListeners();
  }

  updatePosition(x: number, y: number) {
    this.config.position = { x, y };
    this.notifyListeners();
  }

  getConfig(): OverlayConfig {
    return { ...this.config };
  }

  subscribe(listener: (config: OverlayConfig) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getConfig()));
  }
}

export const overlayService = new OverlayService();
