
import { supabase } from "@/integrations/supabase/client";

export interface BackendValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  normalized_value?: string;
}

/**
 * Chama a função de validação do backend para garantir consistência
 */
export async function validateValueOnBackend(tipo: string, valor: string): Promise<BackendValidationResult> {
  try {
    const { data, error } = await supabase.rpc('validate_valor_predefinido', {
      p_tipo: tipo,
      p_valor: valor
    });

    if (error) {
      console.error("Erro ao validar no backend:", error);
      return {
        valid: false,
        error: "Erro interno na validação",
        code: "INTERNAL_ERROR"
      };
    }

    // A função SQL retorna um JSON, então precisamos fazer parse se necessário
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    return result as BackendValidationResult;
  } catch (error) {
    console.error("Erro na validação do backend:", error);
    return {
      valid: false,
      error: "Erro interno na validação",
      code: "INTERNAL_ERROR"
    };
  }
}

/**
 * Obtém a configuração de validação do backend
 * Removida temporariamente até que a função seja adicionada aos tipos do Supabase
 */
export async function getValidationConfigFromBackend() {
  try {
    // Temporariamente comentado até os tipos serem atualizados
    // const { data, error } = await supabase.rpc('get_validation_config');
    
    // Por enquanto, retornar null - a configuração está centralizada no frontend
    console.log("Configuração obtida do frontend - função backend será habilitada após atualização dos tipos");
    return null;
  } catch (error) {
    console.error("Erro ao obter configuração de validação:", error);
    return null;
  }
}
