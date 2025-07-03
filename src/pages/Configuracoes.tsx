
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileTab } from "@/components/configuracoes/ProfileTab";
import { MensagensWhatsAppTab } from "@/components/configuracoes/MensagensWhatsAppTab";
import { PreferencesTab } from "@/components/configuracoes/PreferencesTab";

const Configuracoes = () => {
  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Gerencie suas configurações e preferências do sistema.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <MensagensWhatsAppTab />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
