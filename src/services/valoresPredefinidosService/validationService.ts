
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
 * Obtém a configuração de validação (implementação local)
 */
export async function getValidationConfigFromBackend() {
  // Retornar configuração local em vez de fazer chamada ao backend removido
  return {
    tipos: {
      ufs: {
        tipo: 'string',
        maxLength: 2,
        maxItemsPerOperation: 10,
        description: 'Estados brasileiros (sigla)',
        example: 'SP;RJ;MG'
      },
      servidores: {
        tipo: 'string',
        maxLength: 25,
        maxItemsPerOperation: 10,
        description: 'Nomes de servidores',
        example: 'Servidor1;Servidor2'
      },
      dias_vencimento: {
        tipo: 'integer',
        minValue: 1,
        maxValue: 31,
        maxItemsPerOperation: 10,
        description: 'Dias de vencimento (1-31)',
        example: '10;15;20'
      },
      valores_plano: {
        tipo: 'decimal',
        minValue: 0.01,
        maxValue: 1000,
        decimalPlaces: 2,
        maxItemsPerOperation: 10,
        description: 'Valores de plano (até R$ 1.000)',
        example: '49.90;99.90;199.90'
      },
      dispositivos_smart: {
        tipo: 'string',
        maxLength: 25,
        maxItemsPerOperation: 10,
        description: 'Nomes de dispositivos',
        example: 'TV Box;Smart TV'
      },
      aplicativos: {
        tipo: 'string',
        maxLength: 25,
        maxItemsPerOperation: 10,
        description: 'Nomes de aplicativos',
        example: 'Netflix;YouTube'
      }
    },
    ufsValidas: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
  };
}
