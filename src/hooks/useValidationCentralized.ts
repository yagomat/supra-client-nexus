
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitized_data?: Record<string, any>;
}

interface ValorValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  normalized_value?: string;
}

// Configuração de validação local (movida do backend)
const VALIDATION_CONFIG = {
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

export const useValidationCentralized = () => {
  const [validating, setValidating] = useState(false);

  // Validar dados de cliente usando função centralizada do backend
  const validateCliente = useCallback(async (
    nome: string,
    servidor: string,
    diaVencimento: number,
    aplicativo: string,
    usuarioAplicativo: string,
    senhaAplicativo: string,
    telefone?: string,
    uf?: string,
    valorPlano?: number
  ): Promise<ValidationResult> => {
    setValidating(true);
    
    try {
      const { data, error } = await supabase.rpc('validate_cliente_data_centralized', {
        p_nome: nome,
        p_servidor: servidor,
        p_dia_vencimento: diaVencimento,
        p_aplicativo: aplicativo,
        p_usuario_aplicativo: usuarioAplicativo,
        p_senha_aplicativo: senhaAplicativo,
        p_telefone: telefone || null,
        p_uf: uf || null,
        p_valor_plano: valorPlano || null
      });

      if (error) {
        console.error("Erro ao validar cliente:", error);
        return {
          valid: false,
          errors: ["Erro de conexão ao validar dados do cliente"],
          warnings: []
        };
      }

      return data as unknown as ValidationResult;
    } catch (error) {
      console.error("Erro na validação:", error);
      return {
        valid: false,
        errors: ["Erro interno na validação"],
        warnings: []
      };
    } finally {
      setValidating(false);
    }
  }, []);

  // Validar valor predefinido usando função centralizada do backend
  const validateValorPredefinido = useCallback(async (
    tipo: string,
    valor: string
  ): Promise<ValorValidationResult> => {
    try {
      const { data, error } = await supabase.rpc('validate_valor_predefinido_centralized', {
        p_tipo: tipo,
        p_valor: valor
      });

      if (error) {
        console.error("Erro ao validar valor:", error);
        return {
          valid: false,
          error: "Erro de conexão ao validar valor",
          code: "CONNECTION_ERROR"
        };
      }

      return data as unknown as ValorValidationResult;
    } catch (error) {
      console.error("Erro na validação:", error);
      return {
        valid: false,
        error: "Erro interno na validação",
        code: "INTERNAL_ERROR"
      };
    }
  }, []);

  // Sanitizar entrada usando função centralizada do backend
  const sanitizeInput = useCallback(async (input: string): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('sanitize_input_centralized', {
        p_input: input
      });

      if (error) {
        console.error("Erro ao sanitizar entrada:", error);
        // Fallback para sanitização básica no frontend
        return input.trim().replace(/[<>'"&]/g, '');
      }

      return data as string;
    } catch (error) {
      console.error("Erro na sanitização:", error);
      // Fallback para sanitização básica no frontend
      return input.trim().replace(/[<>'"&]/g, '');
    }
  }, []);

  // Obter configuração de validação (agora local)
  const getValidationConfig = useCallback(async () => {
    // Retornar configuração local em vez de fazer chamada ao backend
    return VALIDATION_CONFIG;
  }, []);

  return {
    validating,
    validateCliente,
    validateValorPredefinido,
    sanitizeInput,
    getValidationConfig
  };
};
