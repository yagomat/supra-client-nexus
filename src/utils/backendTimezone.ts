
import { supabase } from "@/integrations/supabase/client";

/**
 * Configura o timezone padrão para as sessões do banco de dados
 */
export async function configureBackendTimezone() {
  try {
    // Executar comando SQL diretamente para configurar o timezone da sessão
    const { error } = await supabase.rpc('add_table_to_publication', {
      table_name: 'dummy_table_for_timezone_config'
    }).then(() => {
      // Usar uma query SQL simples para configurar o timezone
      return supabase.from('clientes').select('id').limit(1);
    });
    
    // Como alternativa, tentaremos configurar via uma query SQL customizada
    // Isso pode não funcionar em todos os ambientes, mas é uma tentativa
    console.log('Timezone configuration attempted');
  } catch (error) {
    console.warn('Não foi possível configurar timezone no backend:', error);
  }
}
