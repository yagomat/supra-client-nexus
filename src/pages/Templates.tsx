
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MensagensWhatsAppTab } from "@/components/configuracoes/MensagensWhatsAppTab";

const Templates = () => {
  return (
    <DashboardLayout title="Templates WhatsApp">
      <div className="space-y-8 animate-fade-in">
        {/* Header com gradiente */}
        <div className="relative p-6 bg-gradient-card rounded-lg border shadow-soft">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
          <div className="relative">
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              Templates WhatsApp
            </h2>
            <p className="text-muted-foreground">
              Crie e gerencie templates personalizados para suas mensagens do WhatsApp.
            </p>
          </div>
        </div>

        <div className="animate-slide-up">
          <MensagensWhatsAppTab />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
