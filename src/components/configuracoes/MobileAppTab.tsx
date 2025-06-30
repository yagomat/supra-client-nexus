
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, CheckCircle, AlertCircle, Github, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MobileAppTab = () => {
  const { toast } = useToast();
  const appVersion = "1.0.0";
  const lastUpdate = "30/06/2025";

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "Comando copiado!",
      description: "Cole no terminal para executar.",
      duration: 2000,
    });
  };

  const features = [
    "Overlay inteligente no WhatsApp",
    "Detecção automática de clientes", 
    "Templates de mensagem personalizados",
    "Ações rápidas de cobrança",
    "Sincronização em tempo real",
    "Funcionamento offline"
  ];

  const systemRequirements = [
    "Android 7.0 ou superior",
    "Acesso à sobreposição de apps",
    "Permissão de acessibilidade", 
    "WhatsApp instalado"
  ];

  const buildCommands = [
    { step: 1, command: "npm install", description: "Instalar dependências" },
    { step: 2, command: "npm run build", description: "Build do projeto React" },
    { step: 3, command: "npx cap add android", description: "Adicionar plataforma Android" },
    { step: 4, command: "npx cap sync", description: "Sincronizar arquivos" },
    { step: 5, command: "npx cap run android", description: "Executar no dispositivo" }
  ];

  return (
    <div className="space-y-6">
      {/* Informações do App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Supra Client Nexus Mobile (Capacitor)
            <Badge variant="outline">v{appVersion}</Badge>
          </CardTitle>
          <CardDescription>
            Aplicativo Android desenvolvido com Capacitor que oferece overlay para WhatsApp, facilitando o atendimento e cobrança de clientes.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 border rounded">
              <div className="font-medium">Framework</div>
              <div className="text-muted-foreground">Capacitor 5.x</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="font-medium">Versão</div>
              <div className="text-muted-foreground">{appVersion}</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="font-medium">Atualizado</div>
              <div className="text-muted-foreground">{lastUpdate}</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="font-medium">Plataforma</div>
              <div className="text-muted-foreground">Android</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aviso sobre migração */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Migração para Capacitor concluída ✨
          </CardTitle>
          <CardDescription className="text-green-700">
            O projeto foi migrado do Cordova para o Capacitor 5.x, resolvendo conflitos de ES modules e proporcionando melhor integração com React/Vite.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Como gerar o APK com Capacitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Como gerar o aplicativo com Capacitor
          </CardTitle>
          <CardDescription>
            Siga estes passos para gerar o APK usando Capacitor 5.x.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Github className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-blue-800">1. Exportar para GitHub</div>
                <div className="text-sm text-blue-600">
                  Primeiro, exporte o projeto para seu repositório GitHub usando o botão "Export to Github"
                </div>
              </div>
            </div>

            {buildCommands.map((item) => (
              <div key={item.step} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {item.step + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded mt-1 font-mono">
                    {item.command}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCommand(item.command)}
                  className="shrink-0"
                >
                  Copiar
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-green-800">7. APK gerado com sucesso</div>
                <div className="text-sm text-green-600">
                  O APK estará disponível em: android/app/build/outputs/apk/debug/
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>Vantagens do Capacitor:</strong> Melhor integração com Vite/React, suporte nativo a ES modules, 
            debugging mais fácil, melhor performance, e comunidade mais ativa. O Capacitor é mais moderno e estável que o Cordova.
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Principais</CardTitle>
          <CardDescription>
            O que o aplicativo mobile oferece para otimizar seu trabalho.
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

      {/* Requisitos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Requisitos do Sistema
          </CardTitle>
          <CardDescription>
            Certifique-se de que seu dispositivo atende aos requisitos.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {systemRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>{requirement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Instalação */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções de Instalação no Android</CardTitle>
          <CardDescription>
            Após gerar o APK, siga estes passos para instalar no seu dispositivo.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</div>
              <div>
                <div className="font-medium">Transfira o APK para seu celular</div>
                <div className="text-muted-foreground">Use USB, email ou nuvem para transferir o arquivo APK</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</div>
              <div>
                <div className="font-medium">Habilite fontes desconhecidas</div>
                <div className="text-muted-foreground">
                  Configurações → Segurança → Fontes desconhecidas (ou Apps desconhecidos)
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</div>
              <div>
                <div className="font-medium">Instale o APK</div>
                <div className="text-muted-foreground">
                  Abra o arquivo APK baixado e siga as instruções de instalação
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">4</div>
              <div>
                <div className="font-medium">Conceda permissões</div>
                <div className="text-muted-foreground">
                  Permita acesso à sobreposição e acessibilidade quando solicitado
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">5</div>
              <div>
                <div className="font-medium">Configure o overlay</div>
                <div className="text-muted-foreground">
                  Abra o app, faça login e ative o monitoramento do WhatsApp
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
