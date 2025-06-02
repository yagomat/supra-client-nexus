
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvolutionAPISetupGuide } from "./setup/EvolutionAPISetupGuide";
import { N8nWorkflowTemplates } from "./setup/N8nWorkflowTemplates";
import { SetupChecklist } from "./setup/SetupChecklist";

export const ConfigurationGuide = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guide">Guia Completo</TabsTrigger>
          <TabsTrigger value="workflows">Workflows n8n</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="guide">
          <EvolutionAPISetupGuide />
        </TabsContent>

        <TabsContent value="workflows">
          <N8nWorkflowTemplates />
        </TabsContent>

        <TabsContent value="checklist">
          <SetupChecklist />
        </TabsContent>
      </Tabs>
    </div>
  );
};
