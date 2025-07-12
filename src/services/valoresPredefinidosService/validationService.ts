
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
 * Obtém a configuração de validação (fallback local)
 */
export async function getValidationConfigFromBackend() {
  try {
    // Como a função get_validation_config não existe mais, retornar configuração padrão
    return {
      tipos_permitidos: ['servidor', 'aplicativo', 'uf', 'dispositivo_smart', 'plano'],
      validations: {
        servidor: {
          max_length: 50,
          pattern: '^[a-zA-Z0-9\\s\\-_\\.]+$'
        },
        aplicativo: {
          max_length: 50,
          pattern: '^[a-zA-Z0-9\\s\\-_\\.]+$'
        },
        uf: {
          max_length: 2,
          pattern: '^[A-Z]{2}$'
        },
        dispositivo_smart: {
          max_length: 100,
          pattern: '^[a-zA-Z0-9\\s\\-_\\.]+$'
        },
        plano: {
          type: 'numeric',
          min: 0,
          max: 9999.99
        }
      }
    };
  } catch (error) {
    console.error("Erro ao obter configuração de validação:", error);
    return null;
  }
}
