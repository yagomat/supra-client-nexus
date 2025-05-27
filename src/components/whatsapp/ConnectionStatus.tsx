
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Smartphone,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConnectionStatusProps {
  session: {
    id?: string;
    status: string;
    phone_number?: string;
    qr_code?: string;
    last_connected?: string;
    session_data?: any;
  } | null;
}

export const ConnectionStatus = ({ session }: ConnectionStatusProps) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          badgeColor: 'bg-green-500 text-green-50',
          title: 'Conectado',
          description: 'WhatsApp conectado e funcionando normalmente'
        };
      case 'qr_needed':
        return {
          icon: Smartphone,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          badgeColor: 'bg-yellow-500 text-yellow-50',
          title: 'Aguardando QR Code',
          description: 'Escaneie o QR Code com seu WhatsApp para conectar'
        };
      case 'connecting':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          badgeColor: 'bg-blue-500 text-blue-50',
          title: 'Conectando...',
          description: 'Estabelecendo conexão com o WhatsApp'
        };
      case 'authenticating':
        return {
          icon: Settings,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          badgeColor: 'bg-blue-500 text-blue-50',
          title: 'Autenticando...',
          description: 'Verificando credenciais do WhatsApp'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          badgeColor: 'bg-red-600 text-red-50',
          title: 'Erro de Configuração',
          description: 'Verifique se a Evolution API está configurada corretamente'
        };
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          badgeColor: 'bg-gray-500 text-gray-50',
          title: 'Desconectado',
          description: 'WhatsApp não está conectado'
        };
    }
  };

  const statusInfo = getStatusInfo(session?.status || 'disconnected');
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wifi className="h-5 w-5" />
          <span>Status da Conexão</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={statusInfo.bgColor}>
          <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{statusInfo.title}</p>
                <p className="text-sm mt-1">{statusInfo.description}</p>
              </div>
              <Badge className={statusInfo.badgeColor}>
                {statusInfo.title}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {session?.phone_number && (
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Telefone Conectado:</span>
              <span className="text-sm text-gray-900 font-mono">+{session.phone_number}</span>
            </div>
          )}

          {session?.last_connected && (
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Última Conexão:</span>
              <span className="text-sm text-gray-900">
                {format(new Date(session.last_connected), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}

          {session?.session_data?.instanceName && (
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Instância:</span>
              <span className="text-sm text-gray-900 font-mono">{session.session_data.instanceName}</span>
            </div>
          )}
        </div>

        {session?.status === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Problemas de configuração detectados:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Verifique se a Evolution API está rodando</li>
                <li>• Confirme se as variáveis EVOLUTION_API_URL e EVOLUTION_API_KEY estão configuradas</li>
                <li>• Teste a conectividade entre Supabase e seu servidor</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
