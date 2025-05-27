
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WhatsAppBotInterface } from "@/components/whatsapp/WhatsAppBotInterface";
import { Bot } from "lucide-react";

const WhatsappMessenger = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WhatsApp Bot</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus clientes e pagamentos através de comandos no WhatsApp
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

        <WhatsAppBotInterface />
      </div>
    </DashboardLayout>
  );
};

export default WhatsappMessenger;
