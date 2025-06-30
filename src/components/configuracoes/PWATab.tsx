
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Smartphone, Wifi, Download, RefreshCw } from 'lucide-react';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { PWAInstallInstructions } from '@/components/pwa/PWAInstallInstructions';
import { usePWA } from '@/hooks/usePWA';

export const PWATab = () => {
  const { isInstalled } = usePWA();
  
  const features = [
    "Instalação direta do navegador",
    "Funcionamento offline",
    "Atualizações automáticas",
    "Ícone na tela inicial",
    "Interface nativa",
    "Sem necessidade de app store"
  ];

  const advantages = [
    {
      icon: <Download className="h-5 w-5 text-blue-600" />,
      title: "Instalação Simples",
      description: "Instale diretamente do navegador, sem precisar da Play Store"
    },
    {
      icon: <Wifi className="h-5 w-5 text-green-600" />,
      title: "Funciona Offline",
      description: "Continue usando mesmo sem conexão com internet"
    },
    {
      icon: <RefreshCw className="h-5 w-5 text-purple-600" />,
      title: "Sempre Atualizado",
      description: "Receba atualizações automaticamente, sem reinstalar"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status do PWA */}
      <Card className={isInstalled ? "border-green-200 bg-green-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status do PWA
            <Badge variant={isInstalled ? "default" : "outline"}>
              {isInstalled ? "Instalado" : "Não Instalado"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isInstalled 
              ? "O aplicativo está instalado e funcionando como PWA"
              : "Progressive Web App - Aplicativo Web que funciona como nativo"
            }
          </CardDescription>
        </CardHeader>
        
        {isInstalled && (
          <CardContent>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Aplicativo instalado com sucesso!</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Prompt de Instalação */}
      <PWAInstallPrompt />

      {/* Vantagens do PWA */}
      <Card>
        <CardHeader>
          <CardTitle>Vantagens do PWA</CardTitle>
          <CardDescription>
            Por que usar o Progressive Web App ao invés do aplicativo tradicional
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {advantages.map((advantage, index) => (
            <div key={index} className="flex gap-3 p-3 border rounded-lg">
              {advantage.icon}
              <div>
                <div className="font-medium">{advantage.title}</div>
                <div className="text-sm text-muted-foreground">{advantage.description}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Disponíveis</CardTitle>
          <CardDescription>
            O que funciona no PWA do Supra Client Nexus
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Instalação */}
      <PWAInstallInstructions />

      {/* Limitações */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Limitações do PWA</CardTitle>
          <CardDescription className="text-amber-700">
            Funcionalidades que não estão disponíveis no PWA
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-sm text-amber-800">
            <div>• Overlay direto no WhatsApp (necessário copiar/colar mensagens)</div>
            <div>• Acesso total ao sistema de arquivos</div>
            <div>• Algumas permissões específicas do Android</div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 rounded text-sm text-amber-800">
            <strong>Solução:</strong> Para funcionalidade completa de overlay, você ainda pode 
            gerar o APK usando Capacitor após testar o PWA.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
