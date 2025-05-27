
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWhatsAppBot } from "@/hooks/useWhatsAppBot";
import { 
  QrCode, 
  Power, 
  PowerOff, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  BookOpen,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConnectionStatus } from "./ConnectionStatus";
import { ConfigurationGuide } from "./ConfigurationGuide";

export const WhatsAppBotInterface = () => {
  const { 
    session, 
    commands, 
    loading, 
    connecting, 
    initialize, 
    disconnect,
    refreshSession,
    refreshCommands 
  } = useWhatsAppBot();

  const renderQRCode = () => {
    if (!session?.qr_code) return null;

    let qrImageUrl = '';
    if (session.qr_code.startsWith('data:image')) {
      qrImageUrl = session.qr_code;
    } else {
      qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(session.qr_code)}`;
    }

    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg border">
        <QrCode className="h-8 w-8 text-gray-600" />
        <p className="text-sm text-gray-600 text-center">
          Escaneie o QR Code com seu WhatsApp
        </p>
        <img 
          src={qrImageUrl} 
          alt="QR Code WhatsApp" 
          className="border rounded-lg max-w-[200px] max-h-[200px]"
        />
        <p className="text-xs text-gray-500 text-center max-w-sm">
          Abra o WhatsApp no seu celular, vá em "Dispositivos Conectados" e escaneie este código.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshSession}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Atualizar QR Code</span>
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status & Controle</TabsTrigger>
          <TabsTrigger value="commands">Comandos & Histórico</TabsTrigger>
          <TabsTrigger value="config">Guia de Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ConnectionStatus session={session} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Power className="h-5 w-5" />
                  <span>Controles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  {session?.status === 'connected' ? (
                    <Button
                      onClick={disconnect}
                      variant="destructive"
                      className="flex-1"
                    >
                      <PowerOff className="h-4 w-4 mr-2" />
                      Desconectar
                    </Button>
                  ) : (
                    <Button
                      onClick={initialize}
                      disabled={connecting}
                      className="flex-1"
                    >
                      <Power className="h-4 w-4 mr-2" />
                      {connecting ? 'Conectando...' : 'Conectar'}
                    </Button>
                  )}
                </div>

                {session?.status === 'qr_needed' && renderQRCode()}

                {session?.status === 'error' && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Configuração necessária:</strong> Para usar esta funcionalidade, 
                      configure a Evolution API seguindo o guia na aba "Configuração".
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commands" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Comandos Disponíveis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900">Renovar [Nome]</p>
                    <p className="text-sm text-blue-700">Marca pagamento como pago</p>
                    <p className="text-xs text-blue-600 mt-1">Ex: "Renovar João Silva"</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-medium text-green-900">Status [Nome]</p>
                    <p className="text-sm text-green-700">Consulta dados do cliente</p>
                    <p className="text-xs text-green-600 mt-1">Ex: "Status Maria"</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-medium text-yellow-900">Vencimentos</p>
                    <p className="text-sm text-yellow-700">Lista próximos vencimentos</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-medium text-purple-900">Ajuda</p>
                    <p className="text-sm text-purple-700">Mostra lista de comandos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Histórico de Comandos</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshCommands}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {commands.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum comando executado ainda.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {commands.map((command) => (
                        <div 
                          key={command.id} 
                          className="p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant={command.status === 'success' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {command.status === 'success' ? 'Sucesso' : 'Erro'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(command.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{command.command}</p>
                          {command.response_sent && (
                            <p className="text-xs text-gray-600 mt-1">{command.response_sent}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <ConfigurationGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};
