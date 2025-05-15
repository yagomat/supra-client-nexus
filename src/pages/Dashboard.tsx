
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getDashboardStats } from "@/services/supabaseService";
import { DashboardStats } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

    fetchStats();
  }, [toast]);

  return (
    <DashboardLayout>
      <DashboardContent stats={stats} loading={loading} />
    </DashboardLayout>
  );
};

export default Dashboard;
