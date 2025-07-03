
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Smartphone } from 'lucide-react';
import { useCapacitor } from '../hooks/useCapacitor';
import { useWhatsAppDetection } from '../hooks/useWhatsAppDetection';
import { ClienteInfo } from './ClienteInfo';
import { TemplatesList } from './TemplatesList';
import { QuickActions } from './QuickActions';

export const CapacitorOverlayWindow = () => {
  const { isReady, info } = useCapacitor();
  const { currentContact } = useWhatsAppDetection();
  const [isVisible, setIsVisible] = React.useState(true);
  const [position, setPosition] = React.useState({ x: 20, y: 100 });

  // Só mostrar a janela se:
  // 1. Capacitor estiver pronto
  // 2. Houver um contato detectado do WhatsApp
  // 3. Estiver em ambiente móvel ou nativo
  if (!isReady || !currentContact || (!info.isNative && window.innerWidth > 768)) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 bg-white shadow-lg rounded-lg border max-w-sm"
      style={{
        left: position.x,
        top: position.y,
        width: 320,
        maxHeight: 500
      }}
    >
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Supra Client Nexus
              {info.isNative && (
                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                  {info.platform}
                </span>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {info.isNative && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Plataforma: {info.platform} | Capacitor v{info.version}
            </div>
          )}
          
          <div className="text-xs bg-blue-50 p-2 rounded">
            <strong>Contato detectado:</strong> {currentContact.name} ({currentContact.phoneNumber})
          </div>
          
          <ClienteInfo />
          <TemplatesList />
          <QuickActions />
          
          {!info.isNative && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              ⚠️ Modo desenvolvimento - instale o APK para funcionalidade completa
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
