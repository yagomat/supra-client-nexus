
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWhatsAppBot } from "@/hooks/useWhatsAppBot";
import { useWhatsAppTemplates } from "@/hooks/useWhatsAppTemplates";
import { 
  QrCode, 
  Power, 
  PowerOff, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  BookOpen,
  RefreshCw,
  MessageCircle,
  Send,
  Zap,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConnectionStatus } from "./ConnectionStatus";
import { ConfigurationGuide } from "./ConfigurationGuide";
import { TemplateManager } from "./TemplateManager";
import { BillingSettings } from "./BillingSettings";
import { BulkMessaging } from "./BulkMessaging";
import { AutoResponseManager } from "./AutoResponseManager";

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

  const {
    templates,
    autoResponses,
    campaigns,
    messageLogs,
    refreshTemplates,
    refreshAutoResponses,
    refreshCampaigns,
    refreshMessageLogs
  } = useWhatsAppTemplates();

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="status">Status & Controle</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="billing">Cobrança Automática</TabsTrigger>
          <TabsTrigger value="bulk">Envio em Massa</TabsTrigger>
          <TabsTrigger value="autoresponse">Auto-Resposta</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
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

          {/* Commands History */}
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
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager 
            templates={templates} 
            onRefresh={refreshTemplates}
          />
        </TabsContent>

        <TabsContent value="billing">
          <BillingSettings 
            templates={templates}
          />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkMessaging 
            templates={templates}
          />
        </TabsContent>

        <TabsContent value="autoresponse">
          <AutoResponseManager 
            autoResponses={autoResponses}
            onRefresh={refreshAutoResponses}
          />
        </TabsContent>

        <TabsContent value="config">
          <ConfigurationGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};
