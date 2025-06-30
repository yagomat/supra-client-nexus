
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Chrome, Share, Plus, MoreVertical } from 'lucide-react';

export const PWAInstallInstructions = () => {
  const instructions = [
    {
      browser: 'Chrome (Android)',
      icon: <Chrome className="h-4 w-4" />,
      steps: [
        'Toque no menu (⋮) no canto superior direito',
        'Selecione "Instalar app" ou "Adicionar à tela inicial"',
        'Confirme a instalação'
      ]
    },
    {
      browser: 'Safari (iPhone)',
      icon: <Share className="h-4 w-4" />,
      steps: [
        'Toque no botão de compartilhar (□↗)',
        'Role para baixo e toque em "Adicionar à Tela de Início"',
        'Toque em "Adicionar" no canto superior direito'
      ]
    },
    {
      browser: 'Firefox (Android)',
      icon: <MoreVertical className="h-4 w-4" />,
      steps: [
        'Toque no menu (⋮) no canto superior direito',
        'Selecione "Instalar"',
        'Confirme a instalação'
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Como Instalar o App
          <Badge variant="outline">PWA</Badge>
        </CardTitle>
        <CardDescription>
          Instruções para instalar o aplicativo em diferentes navegadores
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {instructions.map((instruction, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              {instruction.icon}
              <span>{instruction.browser}</span>
            </div>
            
            <div className="space-y-2 ml-6">
              {instruction.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex gap-3 text-sm">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {stepIndex + 1}
                  </div>
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Dica:</strong> Após a instalação, o app aparecerá na sua tela inicial 
            e funcionará como um aplicativo nativo, incluindo funcionamento offline.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
