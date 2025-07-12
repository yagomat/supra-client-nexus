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

  // Obter configuração de validação do backend
  const getValidationConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_validation_config');

      if (error) {
        console.error("Erro ao obter configuração:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro ao obter configuração:", error);
      return null;
    }
  }, []);

  return {
    validating,
    validateCliente,
    validateValorPredefinido,
    sanitizeInput,
    getValidationConfig
  };
};