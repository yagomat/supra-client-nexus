
import { supabase } from "@/integrations/supabase/client";
import { ValoresPredefinidos } from "@/types";
import { initializeDefaultValues } from "./defaultValues";
import { processValoresPredefinidos } from "./utils";

/**
 * Busca todos os valores predefinidos para o usuário atual
 */
export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  // Inicializar a estrutura ValoresPredefinidos
  const valoresPredefinidos: ValoresPredefinidos = {
    ufs: [],
    servidores: [],
    dias_vencimento: [],
    valores_plano: [],
    dispositivos_smart: [],
    aplicativos: []
  };
  
  // Obter todos os valores predefinidos para o usuário atual
  let { data, error } = await supabase
    .from('valores_predefinidos')
    .select('tipo, valor')
    .eq('user_id', currentUser.user.id);
    
  if (error) {
    console.error("Erro ao buscar valores predefinidos:", error);
    throw error;
  }
  
  // Se não houver dados, inicializar com valores padrão
  if (!data || data.length === 0) {
    await initializeDefaultValues(currentUser.user.id);
    
    // Buscar os valores padrão recém-criados
    const { data: defaultData, error: defaultError } = await supabase
      .from('valores_predefinidos')
      .select('tipo, valor')
      .eq('user_id', currentUser.user.id);
      
    if (defaultError) {
      console.error("Erro ao buscar valores predefinidos padrão:", defaultError);
      throw defaultError;
    }
    
    // Usar os dados padrão
    data = defaultData;
  }
  
  // Processar e popular os diferentes tipos de valores predefinidos
  return processValoresPredefinidos(data || [], valoresPredefinidos);
}
