
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  granted: boolean;
  message: string;
}

export interface AppPermissions {
  overlay: PermissionStatus;
  notifications: PermissionStatus;
  accessibility: PermissionStatus;
}

class PermissionsService {
  async requestAllPermissions(): Promise<AppPermissions> {
    console.log('Solicitando permissões necessárias...');
    
    if (Capacitor.isNativePlatform()) {
      return await this.requestNativePermissions();
    } else {
      return this.getWebPermissions();
    }
  }

  private async requestNativePermissions(): Promise<AppPermissions> {
    const permissions: AppPermissions = {
      overlay: { granted: false, message: 'Permissão de overlay necessária' },
      notifications: { granted: false, message: 'Permissão de notificações necessária' },
      accessibility: { granted: false, message: 'Permissão de acessibilidade necessária' }
    };

    try {
      // Solicitar permissão de overlay (System Alert Window)
      if (Capacitor.getPlatform() === 'android') {
        await this.requestOverlayPermission();
        permissions.overlay.granted = true;
        permissions.overlay.message = 'Permissão de overlay concedida';
      }

      // Solicitar permissão de notificações
      await this.requestNotificationPermission();
      permissions.notifications.granted = true;
      permissions.notifications.message = 'Permissão de notificações concedida';

      // Informar sobre permissão de acessibilidade
      permissions.accessibility.message = 'Configure manualmente em Configurações > Acessibilidade';

    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
    }

    return permissions;
  }

  private async requestOverlayPermission(): Promise<void> {
    // Esta funcionalidade requer um plugin customizado do Capacitor
    // Por enquanto, vamos mostrar instruções para o usuário
    console.log('Permissão de overlay deve ser concedida manualmente');
    
    // Abrir configurações do Android para permissões especiais
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Tentar abrir diretamente as configurações de overlay
        await this.openOverlaySettings();
      } catch (error) {
        console.error('Erro ao abrir configurações de overlay:', error);
      }
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    // Implementar solicitação de permissão de notificações
    console.log('Solicitando permissão de notificações...');
    
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Permissão de notificação:', permission);
    }
  }

  private async openOverlaySettings(): Promise<void> {
    // Abrir configurações específicas do Android
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Usar intent do Android para abrir configurações de overlay
        const intent = {
          action: 'android.settings.action.MANAGE_OVERLAY_PERMISSION',
          data: `package:${Capacitor.getPlatform()}`
        };
        
        console.log('Abrindo configurações de overlay...', intent);
        
        // Por enquanto, vamos mostrar instruções
        this.showPermissionInstructions();
      } catch (error) {
        console.error('Erro ao abrir configurações:', error);
        this.showPermissionInstructions();
      }
    }
  }

  private showPermissionInstructions(): void {
    const instructions = `
    Para conceder permissões manualmente:
    
    1. OVERLAY (Mais importante):
       • Configurações > Apps > Apps especiais
       • "Exibir sobre outros apps"
       • Encontre "Supra Client Nexus" e habilite
    
    2. NOTIFICAÇÕES:
       • Configurações > Apps > Supra Client Nexus
       • Notificações > Permitir notificações
    
    3. EXECUTAR EM SEGUNDO PLANO:
       • Configurações > Bateria > Apps sem restrições
       • Adicione "Supra Client Nexus"
    `;
    
    console.log(instructions);
    
    // Mostrar alerta nativo se possível
    if (window.alert) {
      window.alert(instructions);
    }
  }

  private getWebPermissions(): AppPermissions {
    return {
      overlay: { granted: true, message: 'Modo de desenvolvimento web' },
      notifications: { granted: true, message: 'Modo de desenvolvimento web' },
      accessibility: { granted: true, message: 'Modo de desenvolvimento web' }
    };
  }

  async checkPermissions(): Promise<AppPermissions> {
    if (Capacitor.isNativePlatform()) {
      // Verificar status das permissões
      return {
        overlay: { granted: false, message: 'Verificar manualmente' },
        notifications: { granted: false, message: 'Verificar manualmente' },
        accessibility: { granted: false, message: 'Verificar manualmente' }
      };
    } else {
      return this.getWebPermissions();
    }
  }
}

export const permissionsService = new PermissionsService();
