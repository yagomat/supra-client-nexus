
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, MessageCircle, Smartphone, Settings } from 'lucide-react';

export const WhatsAppIntegrationGuide = () => {
  const steps = [
    {
      icon: <Settings className="h-5 w-5 text-blue-600" />,
      title: "1. Conceder Permissões",
      description: "Habilite 'Exibir sobre outros apps' nas configurações do Android",
      status: "required"
    },
    {
      icon: <Smartphone className="h-5 w-5 text-green-600" />,
      title: "2. Cadastrar Cliente",
      description: "Certifique-se de que o cliente está cadastrado com o número correto",
      status: "info"
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-purple-600" />,
      title: "3. Abrir WhatsApp",
      description: "Abra uma conversa com o cliente cadastrado",
      status: "info"
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: "4. Ver Overlay",
      description: "O overlay aparecerá automaticamente com as informações do cliente",
      status: "success"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Como usar com WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <MessageCircle className="h-4 w-4" />
          <AlertDescription>
            O aplicativo detecta automaticamente quando você abre o WhatsApp e mostra informações do cliente em uma janela sobreposta.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="font-medium text-yellow-800 text-sm mb-1">
            ⚠️ Problema comum
          </div>
          <div className="text-yellow-700 text-sm">
            Se o overlay não aparecer, verifique se as permissões foram concedidas corretamente. 
            Algumas versões do Android ocultam essas configurações em locais diferentes.
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="font-medium text-green-800 text-sm mb-1">
            ✅ Quando funcionar
          </div>
          <div className="text-green-700 text-sm">
            Você verá uma janela pequena com o nome do cliente, status de pagamento, e botões para ações rápidas como enviar cobrança.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
