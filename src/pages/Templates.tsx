
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MensagensWhatsAppTab } from "@/components/configuracoes/MensagensWhatsAppTab";

const Templates = () => {
  return (
    <DashboardLayout title="Templates WhatsApp">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Configure os templates padrão que serão usados automaticamente pela fila de cobrança.
          </p>
        </div>

        <MensagensWhatsAppTab />
      </div>
    </DashboardLayout>
  );
};

export default Templates;
