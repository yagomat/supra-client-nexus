
import { Capacitor } from '@capacitor/core';

export interface WhatsAppContact {
  name: string;
  phoneNumber: string;
}

class WhatsAppMonitor {
  private isMonitoring = false;
  private listeners: Array<(contact: WhatsAppContact | null) => void> = [];

  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('WhatsApp monitor already running');
      return;
    }

    console.log('Starting WhatsApp monitor with Capacitor');
    
    if (Capacitor.isNativePlatform()) {
      await this.setupNativeMonitoring();
    } else {
      this.setupWebMonitoring();
    }
    
    this.isMonitoring = true;
  }

  private async setupNativeMonitoring() {
    console.log('Setting up native WhatsApp monitoring for', Capacitor.getPlatform());
    
    // Em uma implementação real, aqui usaríamos plugins Capacitor específicos
    // Por exemplo: @capacitor/app, @capacitor/browser, etc.
  }

  private setupWebMonitoring() {
    console.log('Setting up web WhatsApp monitoring simulation');
    
    // Simulação para desenvolvimento web
    const mockContact: WhatsAppContact = {
      name: 'Cliente Teste',
      phoneNumber: '+5511999999999'
    };
    
    // Simular detecção após 2 segundos
    setTimeout(() => {
      console.log('Mock WhatsApp contact detected:', mockContact);
      this.notifyListeners(mockContact);
    }, 2000);
  }

  async stopMonitoring() {
    console.log('Stopping WhatsApp monitor');
    this.isMonitoring = false;
    this.notifyListeners(null);
  }

  isActive() {
    return this.isMonitoring;
  }

  subscribe(listener: (contact: WhatsAppContact | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(contact: WhatsAppContact | null) {
    this.listeners.forEach(listener => listener(contact));
  }
}

export const whatsappMonitor = new WhatsAppMonitor();
