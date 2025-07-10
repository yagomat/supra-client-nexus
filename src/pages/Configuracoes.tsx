
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileTab } from "@/components/configuracoes/ProfileTab";
import { PreferencesTab } from "@/components/configuracoes/PreferencesTab";
import { SecurityAuditTab } from "@/components/configuracoes/SecurityAuditTab";
import { useIsMobile } from "@/hooks/use-mobile";

const Configuracoes = () => {
  const isMobile = useIsMobile();

  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-8 animate-fade-in">
        <Tabs defaultValue="profile" className="w-full">
          {/* Mobile view: horizontal layout */}
          {isMobile ? (
            <div className="space-y-2">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-1">
                <TabsList className="grid grid-cols-3 gap-2 h-auto p-0 bg-transparent w-full">
                  <TabsTrigger 
                    value="profile" 
                    className="text-xs px-2 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="text-xs px-2 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Preferências
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="text-xs px-2 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Logs
                  </TabsTrigger>
                </TabsList>
              </div>
              {/* Content with minimal spacing for mobile */}
              <div className="pt-1">
                <TabsContent value="profile" className="mt-0 space-y-4 animate-slide-up">
                  <ProfileTab />
                </TabsContent>
                <TabsContent value="preferences" className="mt-0 space-y-4 animate-slide-up">
                  <PreferencesTab />
                </TabsContent>
                <TabsContent value="security" className="mt-0 space-y-4 animate-slide-up">
                  <SecurityAuditTab />
                </TabsContent>
              </div>
            </div>
          ) : (
            // Desktop view: updated styling to match banco-dados
            <>
              <TabsList className="grid grid-cols-3 gap-2 p-0 bg-transparent h-auto">
                <TabsTrigger 
                  value="profile"
                  className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Perfil
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences"
                  className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Preferências
                </TabsTrigger>
                <TabsTrigger 
                  value="security"
                  className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Logs
                </TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <TabsContent value="profile" className="space-y-4 animate-slide-up">
                  <ProfileTab />
                </TabsContent>
                <TabsContent value="preferences" className="space-y-4 animate-slide-up">
                  <PreferencesTab />
                </TabsContent>
                <TabsContent value="security" className="space-y-4 animate-slide-up">
                  <SecurityAuditTab />
                </TabsContent>
              </div>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
