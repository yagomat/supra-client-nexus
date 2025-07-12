
import { supabase } from "@/integrations/supabase/client";

export interface BackendValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  normalized_value?: string;
}

/**
 * Chama a função de validação centralizada do backend
 */
export async function validateValueOnBackend(tipo: string, valor: string): Promise<BackendValidationResult> {
  try {
    const { data, error } = await supabase.rpc('validate_valor_predefinido_centralized', {
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

    return data as unknown as BackendValidationResult;
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
 */
export async function getValidationConfigFromBackend() {
  try {
    const { data, error } = await supabase.rpc('get_validation_config');
    
    if (error) {
      console.error("Erro ao obter configuração de validação:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao obter configuração de validação:", error);
    return null;
  }
}
