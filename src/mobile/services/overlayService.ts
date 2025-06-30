
import { Device } from '@capacitor/device';

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
    const info = await Device.getInfo();
    console.log('Initializing overlay service on:', info.platform);
    
    if (info.platform === 'android') {
      await this.setupAndroidOverlay();
    }
  }

  private async setupAndroidOverlay() {
    // Android-specific overlay setup
    console.log('Setting up Android overlay system');
  }

  showOverlay() {
    this.config.isVisible = true;
    this.notifyListeners();
  }

  hideOverlay() {
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
