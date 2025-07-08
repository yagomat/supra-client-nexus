
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileTab } from "@/components/configuracoes/ProfileTab";
import { PreferencesTab } from "@/components/configuracoes/PreferencesTab";
import { SecurityAuditTab } from "@/components/configuracoes/SecurityAuditTab";

const Configuracoes = () => {
  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-8 animate-fade-in">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-subtle shadow-soft border-0 p-1">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-medium transition-all duration-300 font-medium"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-medium transition-all duration-300 font-medium"
            >
              Preferências
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-medium transition-all duration-300 font-medium"
            >
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 animate-slide-up">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 animate-slide-up">
            <PreferencesTab />
          </TabsContent>

          <TabsContent value="security" className="space-y-4 animate-slide-up">
            <SecurityAuditTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
