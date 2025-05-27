
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bot, Calendar, Clock, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WhatsAppBotInterface } from "@/components/whatsapp/WhatsAppBotInterface";

const WhatsappMessenger = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WhatsApp Messenger</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus clientes e pagamentos através do WhatsApp
            </p>
          </div>
        </div>

        <Alert className="bg-blue-50 border border-blue-200">
          <Bot className="h-4 w-4" />
          <AlertTitle>WhatsApp Bot Inteligente</AlertTitle>
          <AlertDescription>
            Automatize a gestão de pagamentos e consultas de clientes enviando comandos 
            diretamente para seu próprio WhatsApp. Configure a Evolution API para começar.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="bot" className="w-full">
          <TabsList>
            <TabsTrigger value="bot">Bot de Comandos</TabsTrigger>
            <TabsTrigger value="direto">Envio Direto</TabsTrigger>
            <TabsTrigger value="agendado">Envio Agendado</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bot">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <span>WhatsApp Bot - Gestão por Comandos</span>
                  </CardTitle>
                  <CardDescription>
                    Configure seu bot para gerenciar clientes e pagamentos através de comandos 
                    de WhatsApp. Envie mensagens para si mesmo e receba respostas automáticas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppBotInterface />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="direto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Envio Direto</span>
                </CardTitle>
                <CardDescription>
                  Envie mensagens instantâneas para seus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-8 flex flex-col items-center justify-center h-60 bg-gray-50">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center font-medium mb-2">
                      Funcionalidade em Desenvolvimento
                    </p>
                    <p className="text-gray-400 text-center text-sm max-w-md">
                      Em breve você poderá enviar mensagens diretas para seus clientes 
                      através desta interface.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agendado">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Envio Agendado</span>
                </CardTitle>
                <CardDescription>
                  Agende mensagens para enviar automaticamente em datas e horários específicos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-8 flex flex-col items-center justify-center h-60 bg-gray-50">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center font-medium mb-2">
                      Funcionalidade em Desenvolvimento
                    </p>
                    <p className="text-gray-400 text-center text-sm max-w-md">
                      Em breve você poderá agendar mensagens para serem enviadas 
                      automaticamente nos horários definidos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Templates de Mensagens</span>
                </CardTitle>
                <CardDescription>
                  Crie e gerencie modelos de mensagens para reutilizar em seus envios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-8 flex flex-col items-center justify-center h-60 bg-gray-50">
                    <Settings className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center font-medium mb-2">
                      Funcionalidade em Desenvolvimento
                    </p>
                    <p className="text-gray-400 text-center text-sm max-w-md">
                      Em breve você poderá criar e gerenciar templates de mensagens 
                      personalizados para seus envios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Histórico de Envios</span>
                </CardTitle>
                <CardDescription>
                  Visualize o histórico completo de mensagens enviadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-8 flex flex-col items-center justify-center h-60 bg-gray-50">
                    <Clock className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center font-medium mb-2">
                      Funcionalidade em Desenvolvimento
                    </p>
                    <p className="text-gray-400 text-center text-sm max-w-md">
                      Em breve você poderá visualizar o histórico completo 
                      de todas as mensagens enviadas através da plataforma.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WhatsappMessenger;
