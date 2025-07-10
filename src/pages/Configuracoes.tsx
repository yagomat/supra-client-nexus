
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/configuracoes/ProfileTab";
import { PreferencesTab } from "@/components/configuracoes/PreferencesTab";
import { SecurityAuditTab } from "@/components/configuracoes/SecurityAuditTab";
import { ConfigTabNavigation } from "@/components/configuracoes/ConfigTabNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

const Configuracoes = () => {
  const isMobile = useIsMobile();

  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-8 animate-fade-in">
        <Tabs defaultValue="profile" className="w-full">
          <div className={isMobile ? "space-y-2" : "space-y-6"}>
            <ConfigTabNavigation isMobile={isMobile} />

            <div className="space-y-6">
              <TabsContent value="profile" className="mt-0">
                <ProfileTab />
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <PreferencesTab />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityAuditTab />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
