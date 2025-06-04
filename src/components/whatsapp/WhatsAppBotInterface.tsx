
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
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-max">
            <TabsTrigger value="status" className="whitespace-nowrap px-3 py-1.5 text-sm">
              Status & Controle
            </TabsTrigger>
            <TabsTrigger value="templates" className="whitespace-nowrap px-3 py-1.5 text-sm">
              Templates
            </TabsTrigger>
            <TabsTrigger value="billing" className="whitespace-nowrap px-3 py-1.5 text-sm">
              Cobrança Automática
            </TabsTrigger>
            <TabsTrigger value="bulk" className="whitespace-nowrap px-3 py-1.5 text-sm">
              Envio em Massa
            </TabsTrigger>
            <TabsTrigger value="autoresponse" className="whitespace-nowrap px-3 py-1.5 text-sm">
              Auto-Resposta
            </TabsTrigger>
            <TabsTrigger value="config" className="whitespace-nowrap px-3 py-1.5 text-sm">
              Configuração
            </TabsTrigger>
          </TabsList>
        </div>

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
