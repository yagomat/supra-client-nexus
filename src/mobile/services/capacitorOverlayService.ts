
import { Capacitor } from '@capacitor/core';

export interface OverlayConfig {
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

class CapacitorOverlayService {
  private config: OverlayConfig = {
    isVisible: false,
    position: { x: 50, y: 100 },
    size: { width: 300, height: 400 }
  };

  private listeners: Array<(config: OverlayConfig) => void> = [];

  async initialize() {
    console.log('Initializing Capacitor overlay service');
    
    if (Capacitor.isNativePlatform()) {
      await this.setupNativeOverlay();
    } else {
      // Development mode - simulate overlay
      this.setupWebOverlay();
    }
  }

  private async setupNativeOverlay() {
    console.log('Setting up native overlay for', Capacitor.getPlatform());
    
    if (Capacitor.getPlatform() === 'android') {
      await this.checkAndroidPermissions();
    }
  }

  private setupWebOverlay() {
    console.log('Setting up web overlay for development');
  }

  private async checkAndroidPermissions() {
    try {
      // Check for system alert window permission
      console.log('Checking Android overlay permissions');
      
      // In a real implementation, we would use a custom plugin
      // For now, we'll simulate the permission check
      const hasPermission = true; // Placeholder
      
      if (!hasPermission) {
        console.warn('System alert window permission not granted');
      }
    } catch (error) {
      console.error('Error checking Android permissions:', error);
    }
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

export const capacitorOverlayService = new CapacitorOverlayService();
