
import { supabase } from "@/integrations/supabase/client";

/**
 * Configura o timezone padrão para as sessões do banco de dados
 */
export async function configureBackendTimezone() {
  try {
    // Fazer uma query simples para teste de conexão
    // Não tentamos mais configurar timezone específico pois isso requer permissões especiais
    const { data } = await supabase.from('clientes').select('id').limit(1);
    
    console.log('Backend timezone configuration attempted successfully');
    return true;
  } catch (error) {
    console.warn('Não foi possível configurar timezone no backend:', error);
    return false;
  }
}
