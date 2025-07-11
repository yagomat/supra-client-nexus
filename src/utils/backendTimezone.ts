
import { supabase } from "@/integrations/supabase/client";

/**
 * Configura o timezone padrão para as sessões do banco de dados
 */
export async function configureBackendTimezone() {
  try {
    // Configurar timezone para a sessão atual
    const { error } = await supabase.rpc('set_session_timezone', {
      timezone: 'America/Sao_Paulo'
    });
    
    if (error) {
      console.warn('Não foi possível configurar timezone no backend:', error);
    }
  } catch (error) {
    console.warn('Erro ao configurar timezone no backend:', error);
  }
}
