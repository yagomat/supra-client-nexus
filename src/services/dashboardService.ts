
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
  
  // Process data for dashboard display
  const processedData = processDashboardData(data);
  
  // Process clients at risk data
  const clientsAtRisk = processClientsAtRisk(data);
  
  // Add clients at risk data to the processed data
  processedData.clientes_em_risco = clientsAtRisk;
  
  return processedData as unknown as DashboardStats;
}

// Helper function to process clients at risk data
function processClientsAtRisk(data: any): any {
  // If the data contains individual client records that will become inactive
  if (data.clientes_em_risco && Array.isArray(data.clientes_em_risco)) {
    return data.clientes_em_risco;
  }
  
  // If we only have count but no detailed data, return empty array
  return [];
}

// Function to process and combine the data of devices and applications
function processDashboardData(data: any): any {
  if (!data) return data;
  
  // Process device distribution
  if (data.distribuicao_dispositivos && Array.isArray(data.distribuicao_dispositivos)) {
    const dispositivosMap = new Map<string, number>();
    
    // Combine counts of same devices
    data.distribuicao_dispositivos.forEach((item: any) => {
      if (item.dispositivo) {
        const dispositivo = item.dispositivo.trim();
        const quantidade = item.quantidade || 0;
        
        if (dispositivosMap.has(dispositivo)) {
          dispositivosMap.set(dispositivo, dispositivosMap.get(dispositivo)! + quantidade);
        } else {
          dispositivosMap.set(dispositivo, quantidade);
        }
      }
    });
    
    // Convert back to array
    const dispositivosCombinados = Array.from(dispositivosMap).map(([dispositivo, quantidade]) => ({
      dispositivo,
      quantidade
    }));
    
    // Sort by quantity (descending)
    data.distribuicao_dispositivos = dispositivosCombinados.sort((a, b) => b.quantidade - a.quantidade);
  }
  
  // Process app distribution
  if (data.distribuicao_aplicativos && Array.isArray(data.distribuicao_aplicativos)) {
    const aplicativosMap = new Map<string, number>();
    
    // Combine counts of same apps
    data.distribuicao_aplicativos.forEach((item: any) => {
      if (item.aplicativo) {
        const aplicativo = item.aplicativo.trim();
        const quantidade = item.quantidade || 0;
        
        if (aplicativosMap.has(aplicativo)) {
          aplicativosMap.set(aplicativo, aplicativosMap.get(aplicativo)! + quantidade);
        } else {
          aplicativosMap.set(aplicativo, quantidade);
        }
      }
    });
    
    // Convert back to array
    const aplicativosCombinados = Array.from(aplicativosMap).map(([aplicativo, quantidade]) => ({
      aplicativo,
      quantidade
    }));
    
    // Sort by quantity (descending)
    data.distribuicao_aplicativos = aplicativosCombinados.sort((a, b) => b.quantidade - a.quantidade);
  }
  
  return data;
}
