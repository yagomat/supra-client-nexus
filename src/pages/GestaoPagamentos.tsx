
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CobrancaKanban } from "@/components/cobranca/CobrancaKanban";

const GestaoPagamentos = () => {
  return (
    <DashboardLayout title="Pagamentos">
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="border rounded-md overflow-hidden h-full">
            <CobrancaKanban />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GestaoPagamentos;
