
import { supabase } from "@/integrations/supabase/client";

// Interface para respostas da função de sanitização
interface SanitizationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Sanitiza dados usando a função centralizada do backend
 */
export const sanitizeInBackend = async <T>(data: any): Promise<T> => {
  try {
    // Usar a nova função centralizada do backend
    if (typeof data === 'string') {
      const { data: response, error } = await supabase.rpc('sanitize_input_centralized', {
        p_input: data
      });

      if (error) {
        console.error("Erro ao sanitizar dados no backend:", error);
        throw new Error(error.message || "Erro ao sanitizar dados");
      }

      return response as T;
    }

    // Para objetos, sanitizar cada propriedade string
    const sanitizedData = { ...data };
    for (const key in sanitizedData) {
      if (typeof sanitizedData[key] === 'string') {
        const { data: response, error } = await supabase.rpc('sanitize_input_centralized', {
          p_input: sanitizedData[key]
        });
        
        if (!error) {
          sanitizedData[key] = response;
        }
      }
    }

    return sanitizedData as T;
  } catch (error) {
    console.error("Erro durante sanitização no backend:", error);
    // Em caso de falha na sanitização do backend, usamos o fallback do frontend
    console.warn("Usando sanitização do frontend como fallback");
    const { sanitizeObject } = await import("./dataSanitization");
    return sanitizeObject(data) as T;
  }
};

/**
 * Sanitiza dados de login no backend 
 */
export const sanitizeLoginDataBackend = async (email: string, password: string): Promise<{ email: string | null | undefined; password: string }> => {
  try {
    // Sanitiza apenas o email no backend (a senha não deve ser sanitizada)
    const sanitizedEmail = await sanitizeInBackend<string>(email);
    
    return {
      email: sanitizedEmail,
      password // Password não é sanitizado para não interferir no hash
    };
  } catch (error) {
    console.error("Erro ao sanitizar dados de login no backend:", error);
    // Fallback para sanitização local
    const { sanitizeLoginData } = await import("./dataSanitization");
    return sanitizeLoginData(email, password);
  }
};

/**
 * Sanitiza dados de cadastro no backend
 */
export const sanitizeSignupDataBackend = async (email: string, password: string, nome: string): Promise<{ 
  email: string | null | undefined; 
  password: string;
  nome: string | null | undefined;
}> => {
  try {
    // Sanitiza email e nome no backend (a senha não deve ser sanitizada)
    const sanitizedEmail = await sanitizeInBackend<string>(email);
    const sanitizedNome = await sanitizeInBackend<string>(nome);
    
    return {
      email: sanitizedEmail,
      nome: sanitizedNome,
      password // Password não é sanitizado para não interferir no hash
    };
  } catch (error) {
    console.error("Erro ao sanitizar dados de cadastro no backend:", error);
    // Fallback para sanitização local
    const { sanitizeSignupData } = await import("./dataSanitization");
    return sanitizeSignupData(email, password, nome);
  }
};
