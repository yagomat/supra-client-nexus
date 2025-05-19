
import { supabase } from "@/integrations/supabase/client";
import { ValoresPredefinidos } from "@/types";

/**
 * Updates a specific type of predefined values for the current user
 */
export async function updateValoresPredefinidos(
  tipo: keyof ValoresPredefinidos, 
  valores: string[] | number[]
): Promise<void> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const user_id = currentUser.user.id;
  
  // Convert tipo to singular form as stored in the database
  const tipoSingular = convertToSingularType(tipo);
  
  // Delete existing values
  await deleteExistingValues(user_id, tipoSingular);
  
  // If there are no values to insert, we're done
  if (valores.length === 0) {
    return;
  }
  
  // Insert new values
  await insertNewValues(user_id, tipoSingular, valores);
}

/**
 * Converts the plural type name to singular as stored in the database
 */
function convertToSingularType(tipo: keyof ValoresPredefinidos): string {
  switch (tipo) {
    case 'ufs':
      return 'uf';
    case 'servidores':
      return 'servidor';
    case 'dias_vencimento':
      return 'dia_vencimento';
    case 'valores_plano':
      return 'valor_plano';
    case 'dispositivos_smart':
      return 'dispositivo_smart';
    case 'aplicativos':
      return 'aplicativo';
    default:
      throw new Error(`Tipo inválido: ${tipo}`);
  }
}

/**
 * Deletes all existing values for a specific type and user
 */
async function deleteExistingValues(userId: string, tipo: string): Promise<void> {
  const { error } = await supabase
    .from('valores_predefinidos')
    .delete()
    .eq('user_id', userId)
    .eq('tipo', tipo);
    
  if (error) {
    console.error("Erro ao excluir valores existentes:", error);
    throw error;
  }
}

/**
 * Inserts new values for a specific type and user
 */
async function insertNewValues(userId: string, tipo: string, valores: string[] | number[]): Promise<void> {
  // Convert values to strings for the insert operation
  const insertData = valores.map(valor => ({
    user_id: userId,
    tipo: tipo,
    valor: valor.toString()
  }));
  
  const { error } = await supabase
    .from('valores_predefinidos')
    .insert(insertData);
    
  if (error) {
    console.error("Erro ao inserir novos valores:", error);
    throw error;
  }
}
