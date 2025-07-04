
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MensagensWhatsAppTab } from "@/components/configuracoes/MensagensWhatsAppTab";

const Templates = () => {
  return (
    <DashboardLayout title="Templates WhatsApp">
      <div className="space-y-6">
        <MensagensWhatsAppTab />
      </div>
    </DashboardLayout>
  );
};

export default Templates;
