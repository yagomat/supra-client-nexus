
import { supabase } from "@/integrations/supabase/client";
import { ValoresPredefinidos } from "@/types";

export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  // Get all predefined values for the current user
  const { data, error } = await supabase
    .from('valores_predefinidos')
    .select('tipo, valor')
    .eq('user_id', currentUser.user.id);
    
  if (error) {
    console.error("Erro ao buscar valores predefinidos:", error);
    throw error;
  }
  
  // Transform the data into the ValoresPredefinidos structure
  const valoresPredefinidos: ValoresPredefinidos = {
    ufs: [],
    servidores: [],
    dias_vencimento: [],
    valores_plano: [],
    dispositivos_smart: [],
    aplicativos: []
  };
  
  // Populate the different types of predefined values
  data?.forEach((item) => {
    const { tipo, valor } = item;
    
    switch (tipo) {
      case 'uf':
        valoresPredefinidos.ufs.push(valor);
        break;
      case 'servidor':
        valoresPredefinidos.servidores.push(valor);
        break;
      case 'dia_vencimento':
        valoresPredefinidos.dias_vencimento.push(parseInt(valor));
        break;
      case 'valor_plano':
        valoresPredefinidos.valores_plano.push(parseFloat(valor));
        break;
      case 'dispositivo_smart':
        valoresPredefinidos.dispositivos_smart.push(valor);
        break;
      case 'aplicativo':
        valoresPredefinidos.aplicativos.push(valor);
        break;
      default:
        break;
    }
  });
  
  // Sort numeric arrays
  valoresPredefinidos.dias_vencimento.sort((a, b) => a - b);
  valoresPredefinidos.valores_plano.sort((a, b) => a - b);
  
  // Sort string arrays alphabetically
  valoresPredefinidos.ufs.sort();
  valoresPredefinidos.servidores.sort();
  valoresPredefinidos.dispositivos_smart.sort();
  valoresPredefinidos.aplicativos.sort();
  
  return valoresPredefinidos;
}

export async function updateValoresPredefinidos(tipo: keyof ValoresPredefinidos, valores: string[] | number[]): Promise<void> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const user_id = currentUser.user.id;
  
  // Convert tipo to singular form as stored in the database
  let tipoSingular: string;
  switch (tipo) {
    case 'ufs':
      tipoSingular = 'uf';
      break;
    case 'servidores':
      tipoSingular = 'servidor';
      break;
    case 'dias_vencimento':
      tipoSingular = 'dia_vencimento';
      break;
    case 'valores_plano':
      tipoSingular = 'valor_plano';
      break;
    case 'dispositivos_smart':
      tipoSingular = 'dispositivo_smart';
      break;
    case 'aplicativos':
      tipoSingular = 'aplicativo';
      break;
    default:
      throw new Error(`Tipo inválido: ${tipo}`);
  }
  
  // Delete all existing values for this type and user
  const { error: deleteError } = await supabase
    .from('valores_predefinidos')
    .delete()
    .eq('user_id', user_id)
    .eq('tipo', tipoSingular);
    
  if (deleteError) {
    console.error("Erro ao excluir valores existentes:", deleteError);
    throw deleteError;
  }
  
  // If there are no values to insert, we're done
  if (valores.length === 0) {
    return;
  }
  
  // Convert values to strings for the insert operation
  const insertData = valores.map(valor => ({
    user_id,
    tipo: tipoSingular,
    valor: valor.toString()
  }));
  
  // Insert new values
  const { error: insertError } = await supabase
    .from('valores_predefinidos')
    .insert(insertData);
    
  if (insertError) {
    console.error("Erro ao inserir novos valores:", insertError);
    throw insertError;
  }
}
