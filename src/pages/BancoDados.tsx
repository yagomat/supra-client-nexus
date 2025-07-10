
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TabsContainer } from "@/components/banco-dados/TabsContainer";

const BancoDados = () => {
  return (
    <DashboardLayout title="Banco de Dados">
      <div className="section-spacing animate-fade-in">
        <div className="animate-slide-up">
          <TabsContainer />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BancoDados;
