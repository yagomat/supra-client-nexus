
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle } from 'lucide-react';
import { useMobileClient } from '../hooks/useMobileClient';

export const TemplatesList = () => {
  const { templates, formatarTemplate, registrarAcao } = useMobileClient();

  const handleCopyTemplate = async (template: any) => {
    const mensagemFormatada = formatarTemplate(template);
    
    try {
      // Use Cordova clipboard or navigator clipboard API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(mensagemFormatada);
      } else {
        // Fallback for older devices
        const textArea = document.createElement('textarea');
        textArea.value = mensagemFormatada;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      await registrarAcao('template_copiado', `Template ${template.tipo} copiado`);
      console.log('Template copiado com sucesso');
    } catch (error) {
      console.error('Erro ao copiar template:', error);
    }
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="text-center text-sm text-muted-foreground">
            Nenhum template disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Templates de Mensagem
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {templates.map((template, index) => (
          <div key={index} className="border rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium capitalize">
                {template.tipo.replace('_', ' ')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyTemplate(template)}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {formatarTemplate(template)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
