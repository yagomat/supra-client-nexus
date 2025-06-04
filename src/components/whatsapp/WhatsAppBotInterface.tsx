
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWhatsAppBot } from "@/hooks/useWhatsAppBot";
import { useWhatsAppTemplates } from "@/hooks/useWhatsAppTemplates";
import { ConnectionStatus } from "./ConnectionStatus";
import { ControlPanel } from "./ControlPanel";
import { CommandHistory } from "./CommandHistory";
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
        <TabsList className="h-auto w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 p-1">
          <TabsTrigger value="status" className="text-xs sm:text-sm px-2 py-2 h-auto">
            <span className="hidden sm:inline">Status & Controle</span>
            <span className="sm:hidden">Status</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm px-2 py-2 h-auto">
            Templates
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs sm:text-sm px-2 py-2 h-auto">
            <span className="hidden sm:inline">Cobrança Automática</span>
            <span className="sm:hidden">Cobrança</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="text-xs sm:text-sm px-2 py-2 h-auto">
            <span className="hidden md:inline">Envio em Massa</span>
            <span className="md:hidden">Massa</span>
          </TabsTrigger>
          <TabsTrigger value="autoresponse" className="text-xs sm:text-sm px-2 py-2 h-auto">
            <span className="hidden md:inline">Auto-Resposta</span>
            <span className="md:hidden">Auto</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs sm:text-sm px-2 py-2 h-auto">
            <span className="hidden sm:inline">Configuração</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ConnectionStatus session={session} />
            <ControlPanel
              session={session}
              connecting={connecting}
              onInitialize={initialize}
              onDisconnect={disconnect}
              onRefreshSession={refreshSession}
            />
          </div>

          <CommandHistory 
            commands={commands}
            onRefresh={refreshCommands}
          />
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
