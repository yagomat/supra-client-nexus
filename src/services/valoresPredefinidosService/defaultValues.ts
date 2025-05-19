
import { supabase } from "@/integrations/supabase/client";

/**
 * Initializes default predefined values for a new user
 */
export async function initializeDefaultValues(userId: string): Promise<void> {
  const defaultValues = getDefaultValuesForUser(userId);
  
  // Insert all the default values
  const { error } = await supabase
    .from('valores_predefinidos')
    .insert(defaultValues);
    
  if (error) {
    console.error("Erro ao inserir valores predefinidos padrão:", error);
    throw error;
  }
}

/**
 * Gets the default values for a user
 */
function getDefaultValuesForUser(userId: string): Array<{ user_id: string; tipo: string; valor: string }> {
  return [
    // UF values for all Brazilian states
    ...getDefaultUfs(userId),
    // Server values
    ...getDefaultServidores(userId),
    // Due dates (all days of the month)
    ...getDefaultDiasVencimento(userId),
    // Plan values
    ...getDefaultValoresPlano(userId),
    // Smart devices
    ...getDefaultDispositivosSmart(userId),
    // Applications
    ...getDefaultAplicativos(userId)
  ];
}

/**
 * Gets default UFs (Brazilian states)
 */
function getDefaultUfs(userId: string): Array<{ user_id: string; tipo: string; valor: string }> {
  const ufs = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", 
    "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", 
    "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"
  ];
  
  return ufs.map(valor => ({ user_id: userId, tipo: 'uf', valor }));
}

/**
 * Gets default servers
 */
function getDefaultServidores(userId: string): Array<{ user_id: string; tipo: string; valor: string }> {
  const servidores = ["Servidor 1", "Servidor 2", "Servidor 3"];
  return servidores.map(valor => ({ user_id: userId, tipo: 'servidor', valor }));
}

/**
 * Gets default due dates
 */
function getDefaultDiasVencimento(userId: string): Array<{ user_id: string; tipo: string; valor: string }> {
  const diasVencimento = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  return diasVencimento.map(valor => ({ user_id: userId, tipo: 'dia_vencimento', valor }));
}

/**
 * Gets default plan values
 */
function getDefaultValoresPlano(userId: string): Array<{ user_id: string; tipo: string; valor: string }> {
  const valoresPlano = ["25.00", "30.00", "35.00", "40.00", "50.00", "60.00"];
  return valoresPlano.map(valor => ({ user_id: userId, tipo: 'valor_plano', valor }));
}

/**
 * Gets default smart devices
 */
function getDefaultDispositivosSmart(userId: string): Array<{ user_id: string; tipo: string; valor: string }> {
  const dispositivosSmart = [
    "Tv Samsung", "Tv LG", "Tv Android", "Tv Roku", 
    "Tv Box", "Celular Android", "Celular Iphone"
  ];
  return dispositivosSmart.map(valor => ({ user_id: userId, tipo: 'dispositivo_smart', valor }));
}

/**
 * Gets default applications
 */
function getDefaultAplicativos(userId: string): Array<{ user_id: string; tipo: string; valor: string }> {
  const aplicativos = ["Aplicativo 1", "Aplicativo 2", "Aplicativo 3"];
  return aplicativos.map(valor => ({ user_id: userId, tipo: 'aplicativo', valor }));
}
