
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, QrCode, CheckCircle, AlertCircle } from 'lucide-react';

export const MobileAppTab = () => {
  const appVersion = "1.0.0";
  const apkSize = "12.5 MB";
  const lastUpdate = "30/06/2025";

  const handleDownloadAPK = () => {
    // Em um ambiente real, isso baixaria o APK do servidor
    const link = document.createElement('a');
    link.href = '/gestor-connect-mobile.apk'; // URL do APK no servidor
    link.download = 'gestor-connect-mobile.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateQRCode = () => {
    // Em um ambiente real, isso geraria um QR code para download
    alert('QR Code para download do APK seria gerado aqui');
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

  return (
    <div className="space-y-6">
      {/* Informações do App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Gestor Connect Mobile
            <Badge variant="outline">v{appVersion}</Badge>
          </CardTitle>
          <CardDescription>
            Aplicativo Android com overlay para WhatsApp que facilita o atendimento e cobrança de clientes.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 border rounded">
              <div className="font-medium">Versão</div>
              <div className="text-muted-foreground">{appVersion}</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="font-medium">Tamanho</div>
              <div className="text-muted-foreground">{apkSize}</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="font-medium">Atualizado</div>
              <div className="text-muted-foreground">{lastUpdate}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download do Aplicativo
          </CardTitle>
          <CardDescription>
            Baixe e instale o aplicativo Android em seu dispositivo.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadAPK} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Baixar APK ({apkSize})
            </Button>
            
            <Button variant="outline" onClick={generateQRCode} className="flex-1">
              <QrCode className="h-4 w-4 mr-2" />
              Gerar QR Code
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>Importante:</strong> Como este é um APK personalizado, você precisará habilitar 
            "Fontes desconhecidas" nas configurações do Android para instalá-lo.
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
          <CardTitle>Instruções de Instalação</CardTitle>
          <CardDescription>
            Siga estes passos para instalar o aplicativo corretamente.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</div>
              <div>
                <div className="font-medium">Baixe o APK</div>
                <div className="text-muted-foreground">Clique no botão "Baixar APK" acima</div>
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
