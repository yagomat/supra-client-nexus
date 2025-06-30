
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Calendar, DollarSign } from 'lucide-react';
import { useMobileClient } from '../hooks/useMobileClient';

export const ClienteInfo = () => {
  const { cliente, loading } = useMobileClient();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="text-center text-sm text-muted-foreground">
            Carregando informações do cliente...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cliente) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado para este número
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          {cliente.nome}
          <Badge variant={cliente.status === 'ativo' ? 'default' : 'secondary'}>
            {cliente.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          <span>{cliente.telefone}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>Vence dia {cliente.dia_vencimento}</span>
        </div>
        
        {cliente.valor_plano && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3" />
            <span>R$ {cliente.valor_plano.toFixed(2)}</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Servidor: {cliente.servidor}
        </div>
        
        {cliente.observacoes && (
          <div className="text-xs p-2 bg-muted rounded">
            {cliente.observacoes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
