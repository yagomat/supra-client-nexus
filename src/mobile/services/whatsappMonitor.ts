
export interface WhatsAppContact {
  phoneNumber: string;
  name?: string;
}

class WhatsAppMonitor {
  private isMonitoring = false;
  private currentContact: WhatsAppContact | null = null;
  private listeners: Array<(contact: WhatsAppContact | null) => void> = [];

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting WhatsApp monitoring');
    
    // Simular detecção do WhatsApp
    this.simulateWhatsAppDetection();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('Stopping WhatsApp monitoring');
  }

  private simulateWhatsAppDetection() {
    // Em uma implementação real, isso detectaria quando o WhatsApp está ativo
    // e extrairia o número de telefone da conversa atual
    setTimeout(() => {
      if (this.isMonitoring) {
        const contact: WhatsAppContact = {
          phoneNumber: '5562727275558',
          name: 'Contato Exemplo'
        };
        this.setCurrentContact(contact);
      }
    }, 3000);
  }

  private setCurrentContact(contact: WhatsAppContact | null) {
    this.currentContact = contact;
    this.notifyListeners();
  }

  getCurrentContact(): WhatsAppContact | null {
    return this.currentContact;
  }

  subscribe(listener: (contact: WhatsAppContact | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentContact));
  }
}

export const whatsappMonitor = new WhatsAppMonitor();
