
import { supabase } from "@/integrations/supabase/client";
import { ValoresPredefinidos } from "@/types";
import { initializeDefaultValues } from "./defaultValues";

/**
 * Fetches all predefined values for the current user
 */
export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  // Initialize the ValoresPredefinidos structure
  const valoresPredefinidos: ValoresPredefinidos = {
    ufs: [],
    servidores: [],
    dias_vencimento: [],
    valores_plano: [],
    dispositivos_smart: [],
    aplicativos: []
  };
  
  // Get all predefined values for the current user
  let { data, error } = await supabase
    .from('valores_predefinidos')
    .select('tipo, valor')
    .eq('user_id', currentUser.user.id);
    
  if (error) {
    console.error("Erro ao buscar valores predefinidos:", error);
    throw error;
  }
  
  // If there's no data, initialize with default values
  if (!data || data.length === 0) {
    await initializeDefaultValues(currentUser.user.id);
    
    // Fetch the newly created default values
    const { data: defaultData, error: defaultError } = await supabase
      .from('valores_predefinidos')
      .select('tipo, valor')
      .eq('user_id', currentUser.user.id);
      
    if (defaultError) {
      console.error("Erro ao buscar valores predefinidos padrão:", defaultError);
      throw defaultError;
    }
    
    // Use the default data
    data = defaultData;
  }
  
  // Process and populate the different types of predefined values
  return processValoresPredefinidos(data || [], valoresPredefinidos);
}

/**
 * Process raw database values into the ValoresPredefinidos structure
 */
function processValoresPredefinidos(
  data: { tipo: string; valor: string }[], 
  valoresPredefinidos: ValoresPredefinidos
): ValoresPredefinidos {
  // Populate the different types of predefined values
  data.forEach((item) => {
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
  
  // Sort arrays
  sortValoresPredefinidos(valoresPredefinidos);
  
  return valoresPredefinidos;
}

/**
 * Sort all arrays in the ValoresPredefinidos object
 */
function sortValoresPredefinidos(valoresPredefinidos: ValoresPredefinidos): void {
  // Sort numeric arrays
  valoresPredefinidos.dias_vencimento.sort((a, b) => a - b);
  valoresPredefinidos.valores_plano.sort((a, b) => a - b);
  
  // Sort string arrays alphabetically
  valoresPredefinidos.ufs.sort();
  valoresPredefinidos.servidores.sort();
  valoresPredefinidos.dispositivos_smart.sort();
  valoresPredefinidos.aplicativos.sort();
}
