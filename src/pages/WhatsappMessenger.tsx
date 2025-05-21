
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const WhatsappMessenger = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Messenger</h1>
        </div>

        <Alert className="bg-slate-50 border border-slate-200">
          <MessageSquare className="h-4 w-4" />
          <AlertTitle>Funcionalidade em desenvolvimento</AlertTitle>
          <AlertDescription>
            O sistema de envio de mensagens pelo WhatsApp será implementado em breve. Esta página está preparada para a funcionalidade de agendamento de mensagens.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="direto" className="w-full">
          <TabsList>
            <TabsTrigger value="direto">Envio Direto</TabsTrigger>
            <TabsTrigger value="agendado">Envio Agendado</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="direto">
            <Card>
              <CardHeader>
                <CardTitle>Envio Direto</CardTitle>
                <CardDescription>
                  Envie mensagens instantâneas para seus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center h-60">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Aqui você poderá enviar mensagens diretas para seus clientes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agendado">
            <Card>
              <CardHeader>
                <CardTitle>Envio Agendado</CardTitle>
                <CardDescription>
                  Agende mensagens para enviar automaticamente em datas e horários específicos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center h-60">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Aqui você poderá agendar mensagens para serem enviadas automaticamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagens</CardTitle>
                <CardDescription>
                  Crie modelos de mensagens para reutilizar em seus envios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center h-60">
                    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Aqui você poderá criar e gerenciar templates de mensagens.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Envios</CardTitle>
                <CardDescription>
                  Visualize o histórico de mensagens enviadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center h-60">
                    <Clock className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Aqui você poderá visualizar o histórico de mensagens enviadas.
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
