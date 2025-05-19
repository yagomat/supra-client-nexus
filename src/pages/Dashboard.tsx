
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getDashboardStats, recalculateAllClientStatus } from "@/services/dashboardService";
import { DashboardStats } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas", error);
      toast({
        title: "Erro ao carregar o dashboard",
        description: "Não foi possível carregar as estatísticas. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [toast]);

  const handleRecalculateStatus = async () => {
    try {
      setRecalculating(true);
      await recalculateAllClientStatus();
      
      toast({
        title: "Status recalculados",
        description: "Os status de todos os clientes foram recalculados com sucesso.",
      });
      
      // Recarregar estatísticas
      fetchStats();
    } catch (error: any) {
      console.error("Erro ao recalcular status", error);
      
      // Verifica se é um erro de permissão
      const errorMessage = error?.message?.includes("Sem permissão") 
        ? "Você não tem permissão para realizar esta ação. Apenas administradores e gerentes podem recalcular o status de todos os clientes."
        : "Não foi possível recalcular o status dos clientes. Por favor, tente novamente mais tarde.";
      
      toast({
        title: "Erro ao recalcular status",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button 
            onClick={handleRecalculateStatus} 
            disabled={recalculating}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculando...' : 'Recalcular Status'}
          </Button>
        </div>
        <DashboardContent stats={stats} loading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
