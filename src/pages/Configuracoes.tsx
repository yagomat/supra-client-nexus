
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/configuracoes/ProfileTab";
import { PreferencesTab } from "@/components/configuracoes/PreferencesTab";
import { MensagensWhatsAppTab } from "@/components/configuracoes/MensagensWhatsAppTab";
import { TemplatesPersonalizados } from "@/components/configuracoes/TemplatesPersonalizados";

const Configuracoes = () => {
  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Gerencie suas configurações de conta e preferências.
          </p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            <TabsTrigger value="whatsapp">Mensagens WhatsApp</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="perfil" className="space-y-4">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="preferencias" className="space-y-4">
            <PreferencesTab />
          </TabsContent>
          
          <TabsContent value="whatsapp" className="space-y-4">
            <MensagensWhatsAppTab />
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <TemplatesPersonalizados />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
