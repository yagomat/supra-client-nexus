
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getDashboardStats } from "@/services/dashboardService";
import { DashboardStats } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      console.log("Dashboard stats data:", data);
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
    
    // Subscribe to realtime changes on both pagamentos and clientes tables
    const pagamentosChannel = supabase
      .channel('pagamentos-dashboard-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
        }, 
        () => {
          // Refresh dashboard data when payments change
          fetchStats();
        }
      )
      .subscribe();
    
    const clientesChannel = supabase
      .channel('clientes-dashboard-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clientes',
        }, 
        () => {
          // Refresh dashboard data when clients change
          fetchStats();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(pagamentosChannel);
      supabase.removeChannel(clientesChannel);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <DashboardContent stats={stats} loading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
