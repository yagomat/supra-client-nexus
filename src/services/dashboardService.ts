
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
  
  // Get detailed client risk information
  const clientesRiscoDetalhes = await getClientesEmRiscoDetalhes(currentUser.user.id);
  
  // Add client risk details to the processed data
  processedData.clientes_em_risco_detalhes = clientesRiscoDetalhes;
  
  return processedData as unknown as DashboardStats;
}

// Nova função para obter detalhes dos clientes em risco
async function getClientesEmRiscoDetalhes(userId: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, servidor, dia_vencimento')
    .eq('user_id', userId)
    .eq('status', 'ativo');

  if (error) {
    console.error("Erro ao buscar clientes em risco:", error);
    return [];
  }

  if (!data) return [];

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  // Calcular mês anterior
  let mesAnterior = mesAtual - 1;
  let anoAnterior = anoAtual;
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = anoAtual - 1;
  }

  const clientesEmRisco = [];

  for (const cliente of data) {
    // Verificar se pagou o mês atual
    const { data: pagamentoAtual } = await supabase
      .from('pagamentos')
      .select('id')
      .eq('cliente_id', cliente.id)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)
      .in('status', ['pago', 'pago_confianca'])
      .maybeSingle();

    // Se já pagou o mês atual, não está em risco
    if (pagamentoAtual) continue;

    // Verificar se pagou o mês anterior
    const { data: pagamentoAnterior } = await supabase
      .from('pagamentos')
      .select('id')
      .eq('cliente_id', cliente.id)
      .eq('mes', mesAnterior)
      .eq('ano', anoAnterior)
      .in('status', ['pago', 'pago_confianca'])
      .maybeSingle();

    // Se pagou o mês anterior e está dentro do prazo de vencimento
    if (pagamentoAnterior && diaAtual <= cliente.dia_vencimento) {
      const diasRestantes = cliente.dia_vencimento - diaAtual;
      
      // Se vence nos próximos 3 dias (inclusive hoje)
      if (diasRestantes <= 3) {
        clientesEmRisco.push({
          id: cliente.id,
          nome: cliente.nome,
          servidor: cliente.servidor,
          dias_restantes: diasRestantes
        });
      }
    }
  }

  // Ordenar por dias restantes (menos dias primeiro)
  return clientesEmRisco.sort((a, b) => a.dias_restantes - b.dias_restantes);
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
