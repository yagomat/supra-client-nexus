
import { supabase } from "@/integrations/supabase/client";
import { ValoresPredefinidos } from "@/types";

export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase
    .from('valores_predefinidos')
    .select('*')
    .eq('user_id', currentUser.user.id);
    
  if (error) {
    console.error("Erro ao buscar valores predefinidos:", error);
    throw error;
  }
  
  // Processar os valores para o formato esperado
  const valoresPredefinidos: ValoresPredefinidos = {
    ufs: [],
    servidores: [],
    dias_vencimento: [],
    valores_plano: [],
    dispositivos_smart: [],
    aplicativos: []
  };
  
  if (data && data.length > 0) {
    data.forEach((item) => {
      const tipo = item.tipo as keyof ValoresPredefinidos;
      const valor = item.valor;
      
      if (tipo === 'dias_vencimento') {
        valoresPredefinidos[tipo].push(parseInt(valor));
      } else if (tipo === 'valores_plano') {
        valoresPredefinidos[tipo].push(parseFloat(valor));
      } else if (Object.keys(valoresPredefinidos).includes(tipo)) {
        (valoresPredefinidos[tipo] as string[]).push(valor);
      }
    });
    
    // Ordenar os valores
    valoresPredefinidos.ufs.sort();
    valoresPredefinidos.servidores.sort();
    valoresPredefinidos.dias_vencimento.sort((a, b) => a - b);
    valoresPredefinidos.valores_plano.sort((a, b) => a - b);
    valoresPredefinidos.dispositivos_smart.sort();
    valoresPredefinidos.aplicativos.sort();
  }
  
  return valoresPredefinidos;
}

export async function updateValoresPredefinidos(
  tipo: keyof ValoresPredefinidos, 
  valores: string[] | number[]
): Promise<void> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const userId = currentUser.user.id;
  
  // Primeiro, excluir todos os valores existentes deste tipo para este usuário
  const { error: deleteError } = await supabase
    .from('valores_predefinidos')
    .delete()
    .eq('user_id', userId)
    .eq('tipo', tipo);
    
  if (deleteError) {
    console.error(`Erro ao excluir valores predefinidos do tipo ${tipo}:`, deleteError);
    throw deleteError;
  }
  
  // Em seguida, inserir os novos valores
  if (valores.length > 0) {
    const valoresParaInserir = valores.map((valor) => ({
      user_id: userId,
      tipo,
      valor: valor.toString(),
    }));
    
    const { error: insertError } = await supabase
      .from('valores_predefinidos')
      .insert(valoresParaInserir);
      
    if (insertError) {
      console.error(`Erro ao inserir valores predefinidos do tipo ${tipo}:`, insertError);
      throw insertError;
    }
  }
}
