
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
  try {
    // Since we can only use the functions defined in the Supabase type
    const { error } = await supabase.rpc('recalculate_all_client_status');
    
    if (error) {
      // Check if it's a permission error (this part is still useful)
      if (error.message.includes("Sem permissão")) {
        throw new Error("Sem permissão para recalcular status dos clientes");
      }
      console.error("Erro ao recalcular status dos clientes:", error);
      throw error;
    }
    
    console.log("Clientes recalculados com sucesso");
  } catch (error) {
    console.error("Erro ao chamar função RPC:", error);
    throw error;
  }
}
