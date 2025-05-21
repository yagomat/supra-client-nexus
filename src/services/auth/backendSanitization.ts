
import { supabase } from "@/integrations/supabase/client";

// Interface para respostas da função de sanitização
interface SanitizationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Sanitiza dados no backend antes de usá-los em outras operações
 * Esta função serve como uma camada intermediária para garantir
 * que todos os dados sejam sanitizados no servidor
 */
export const sanitizeInBackend = async <T>(data: any): Promise<T> => {
  try {
    const { data: response, error } = await supabase.functions.invoke<SanitizationResponse<T>>(
      'sanitize-input',
      {
        body: data,
      }
    );

    if (error) {
      console.error("Erro ao sanitizar dados no backend:", error);
      throw new Error(error.message || "Erro ao sanitizar dados");
    }

    if (!response.success) {
      throw new Error(response.error || "Falha na sanitização de dados");
    }

    return response.data as T;
  } catch (error) {
    console.error("Erro durante sanitização no backend:", error);
    // Em caso de falha na sanitização do backend, usamos o fallback do frontend
    // Isso garante que pelo menos alguma sanitização seja aplicada
    console.warn("Usando sanitização do frontend como fallback");
    const { sanitizeObject } = await import("./dataSanitization");
    return sanitizeObject(data) as T;
  }
};

/**
 * Sanitiza dados de login no backend e então passa para a função de autenticação
 */
export const sanitizeLoginDataBackend = async (email: string, password: string): Promise<{ email: string | null | undefined; password: string }> => {
  try {
    // Sanitiza apenas o email no backend (a senha não deve ser sanitizada para não afetar o hash)
    const sanitizedData = await sanitizeInBackend<{ email: string | null | undefined; }>({ email });
    
    return {
      email: sanitizedData.email,
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
 * Sanitiza dados de cadastro no backend e então passa para a função de autenticação
 */
export const sanitizeSignupDataBackend = async (email: string, password: string, nome: string): Promise<{ 
  email: string | null | undefined; 
  password: string;
  nome: string | null | undefined;
}> => {
  try {
    // Sanitiza email e nome no backend (a senha não deve ser sanitizada)
    const sanitizedData = await sanitizeInBackend<{ 
      email: string | null | undefined; 
      nome: string | null | undefined; 
    }>({ email, nome });
    
    return {
      email: sanitizedData.email,
      nome: sanitizedData.nome,
      password // Password não é sanitizado para não interferir no hash
    };
  } catch (error) {
    console.error("Erro ao sanitizar dados de cadastro no backend:", error);
    // Fallback para sanitização local
    const { sanitizeSignupData } = await import("./dataSanitization");
    return sanitizeSignupData(email, password, nome);
  }
};
