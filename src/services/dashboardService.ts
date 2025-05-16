
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase.rpc(
    'get_dashboard_stats', 
    { user_id_param: currentUser.user.id }
  );
  
  if (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw error;
  }
  
  return data as unknown as DashboardStats;
}

export async function recalculateAllClientStatus(): Promise<void> {
  const { error } = await supabase.rpc('recalculate_all_client_status');
  
  if (error) {
    console.error("Erro ao recalcular status dos clientes:", error);
    throw error;
  }
}
