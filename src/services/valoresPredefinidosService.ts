
import { supabase } from "@/integrations/supabase/client";
import { ValoresPredefinidos } from "@/types";

export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  // Transform data into the ValoresPredefinidos structure
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

async function initializeDefaultValues(userId: string): Promise<void> {
  // UF values for all Brazilian states
  const ufs = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", 
    "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", 
    "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"
  ];
  
  // Server values
  const servidores = ["Servidor 1", "Servidor 2", "Servidor 3"];
  
  // Due dates (all days of the month)
  const diasVencimento = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  
  // Plan values
  const valoresPlano = ["25.00", "30.00", "35.00", "40.00", "50.00", "60.00"];
  
  // Smart devices
  const dispositivosSmart = [
    "Tv Samsung", "Tv LG", "Tv Android", "Tv Roku", 
    "Tv Box", "Celular Android", "Celular Iphone"
  ];
  
  // Applications
  const aplicativos = ["Aplicativo 1", "Aplicativo 2", "Aplicativo 3"];
  
  // Prepare all the insert data
  const insertData = [
    ...ufs.map(valor => ({ user_id: userId, tipo: 'uf', valor })),
    ...servidores.map(valor => ({ user_id: userId, tipo: 'servidor', valor })),
    ...diasVencimento.map(valor => ({ user_id: userId, tipo: 'dia_vencimento', valor })),
    ...valoresPlano.map(valor => ({ user_id: userId, tipo: 'valor_plano', valor })),
    ...dispositivosSmart.map(valor => ({ user_id: userId, tipo: 'dispositivo_smart', valor })),
    ...aplicativos.map(valor => ({ user_id: userId, tipo: 'aplicativo', valor }))
  ];
  
  // Insert all the default values
  const { error } = await supabase
    .from('valores_predefinidos')
    .insert(insertData);
    
  if (error) {
    console.error("Erro ao inserir valores predefinidos padrão:", error);
    throw error;
  }
}
