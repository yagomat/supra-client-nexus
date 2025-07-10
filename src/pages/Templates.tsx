
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MensagensWhatsAppTab } from "@/components/configuracoes/MensagensWhatsAppTab";

const Templates = () => {
  return (
    <DashboardLayout title="Templates">
      <div className="space-y-8 animate-fade-in">
        <div className="animate-slide-up">
          <MensagensWhatsAppTab />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
