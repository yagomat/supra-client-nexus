
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
  
  // Processar os dados para combinar dispositivos e aplicativos das telas principal e adicional
  const processedData = processDashboardData(data);
  
  return processedData as unknown as DashboardStats;
}

// Nova função para processar e combinar os dados de dispositivos e aplicativos
function processDashboardData(data: any): any {
  if (!data) return data;
  
  // Processar distribuição de dispositivos
  if (data.distribuicao_dispositivos && Array.isArray(data.distribuicao_dispositivos)) {
    const dispositivosMap = new Map<string, number>();
    
    // Combinar contagens de dispositivos iguais
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
    
    // Converter de volta para array
    const dispositivosCombinados = Array.from(dispositivosMap).map(([dispositivo, quantidade]) => ({
      dispositivo,
      quantidade
    }));
    
    // Ordenar por quantidade (decrescente)
    data.distribuicao_dispositivos = dispositivosCombinados.sort((a, b) => b.quantidade - a.quantidade);
  }
  
  // Processar distribuição de aplicativos
  if (data.distribuicao_aplicativos && Array.isArray(data.distribuicao_aplicativos)) {
    const aplicativosMap = new Map<string, number>();
    
    // Combinar contagens de aplicativos iguais
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
    
    // Converter de volta para array
    const aplicativosCombinados = Array.from(aplicativosMap).map(([aplicativo, quantidade]) => ({
      aplicativo,
      quantidade
    }));
    
    // Ordenar por quantidade (decrescente)
    data.distribuicao_aplicativos = aplicativosCombinados.sort((a, b) => b.quantidade - a.quantidade);
  }
  
  return data;
}
