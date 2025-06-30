
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Phone, MessageSquare } from 'lucide-react';
import { useMobileClient } from '../hooks/useMobileClient';

export const QuickActions = () => {
  const { registrarAcao } = useMobileClient();

  const actions = [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Contactado',
      action: 'contactado',
      variant: 'default' as const
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Lembrar +tarde',
      action: 'lembrar_mais_tarde',
      variant: 'outline' as const
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: 'Não atendeu',
      action: 'nao_atendeu',
      variant: 'outline' as const
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      label: 'Msg enviada',
      action: 'mensagem_enviada',
      variant: 'default' as const
    }
  ];

  const handleAction = async (action: string, label: string) => {
    await registrarAcao(action, `Ação executada via mobile: ${label}`);
    console.log(`Ação registrada: ${action}`);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ações Rápidas</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              onClick={() => handleAction(action.action, action.label)}
              className="text-xs h-8"
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
