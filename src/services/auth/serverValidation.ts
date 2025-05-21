
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface para erros de validação
interface ValidationError {
  field: string;
  message: string;
}

// Função para validar credenciais de login no servidor
export const validateLoginCredentials = async (
  email: string,
  password: string
): Promise<{valid: boolean; errors?: ValidationError[]}> => {
  try {
    const { data, error } = await supabase.rpc('validate_login_credentials', {
      p_email: email,
      p_password: password
    });
    
    if (error) {
      console.error("Erro de validação no servidor:", error);
      return {
        valid: false,
        errors: [{field: 'general', message: 'Erro ao validar credenciais no servidor'}]
      };
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao validar credenciais:", error);
    return {
      valid: false,
      errors: [{field: 'general', message: 'Erro de conexão ao validar credenciais'}]
    };
  }
};

// Função para validar dados de cadastro no servidor
export const validateSignupData = async (
  email: string,
  password: string,
  nome: string
): Promise<{valid: boolean; errors?: ValidationError[]}> => {
  try {
    const { data, error } = await supabase.rpc('validate_signup_data', {
      p_email: email,
      p_password: password,
      p_nome: nome
    });
    
    if (error) {
      console.error("Erro de validação no servidor:", error);
      return {
        valid: false,
        errors: [{field: 'general', message: 'Erro ao validar dados no servidor'}]
      };
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao validar dados de cadastro:", error);
    return {
      valid: false,
      errors: [{field: 'general', message: 'Erro de conexão ao validar dados'}]
    };
  }
};
