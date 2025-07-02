
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Settings, Smartphone, Shield } from 'lucide-react';
import { permissionsService, AppPermissions } from '../services/permissionsService';
import { useCapacitor } from '../hooks/useCapacitor';

export const PermissionsSetup = () => {
  const [permissions, setPermissions] = useState<AppPermissions | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const { isNative } = useCapacitor();

  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    try {
      const currentPermissions = await permissionsService.checkPermissions();
      setPermissions(currentPermissions);
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  };

  const requestPermissions = async () => {
    setIsRequesting(true);
    try {
      const result = await permissionsService.requestAllPermissions();
      setPermissions(result);
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const openAndroidSettings = () => {
    // Mostrar instruções detalhadas
    const instructions = `
INSTRUÇÕES PARA HABILITAR PERMISSÕES:

🔧 PASSO 1 - OVERLAY (ESSENCIAL):
• Configurações do Android
• Apps > Apps especiais  
• "Exibir sobre outros apps" ou "Draw over other apps"
• Encontre "Supra Client Nexus"
• Habilite a opção

📱 PASSO 2 - NOTIFICAÇÕES:
• Configurações > Apps > Supra Client Nexus
• Notificações > Permitir todas

🔋 PASSO 3 - SEGUNDO PLANO:
• Configurações > Bateria 
• Otimização de bateria
• Encontre "Supra Client Nexus"
• Selecione "Não otimizar"

⚠️ SEM ESSAS PERMISSÕES O APP NÃO FUNCIONARÁ COM WHATSAPP!
    `;

    if (window.alert) {
      window.alert(instructions);
    }
    console.log(instructions);
  };

  if (!isNative) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Smartphone className="h-5 w-5" />
            Modo Desenvolvimento Web
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            As permissões são simuladas no modo web. Instale o APK no dispositivo Android para funcionalidade completa.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuração de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Para o aplicativo funcionar com WhatsApp, você precisa conceder permissões especiais manualmente no Android.
            </AlertDescription>
          </Alert>

          {permissions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {permissions.overlay.granted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">Exibir sobre outros apps</span>
                </div>
                <Badge variant={permissions.overlay.granted ? "default" : "destructive"}>
                  {permissions.overlay.granted ? "Concedida" : "Necessária"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {permissions.notifications.granted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">Notificações</span>
                </div>
                <Badge variant={permissions.notifications.granted ? "default" : "destructive"}>
                  {permissions.notifications.granted ? "Concedida" : "Necessária"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Executar em segundo plano</span>
                </div>
                <Badge variant="outline">Manual</Badge>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={requestPermissions} 
              disabled={isRequesting}
              className="w-full"
            >
              {isRequesting ? 'Solicitando...' : 'Solicitar Permissões'}
            </Button>
            
            <Button 
              onClick={openAndroidSettings}
              variant="outline"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Ver Instruções Detalhadas
            </Button>

            <Button 
              onClick={checkCurrentPermissions}
              variant="secondary"
              className="w-full"
            >
              Verificar Permissões Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
