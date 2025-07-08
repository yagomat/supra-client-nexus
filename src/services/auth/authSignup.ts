import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";

// Cadastro seguro com validações
export const secureSignUp = async (email: string, password: string, nome: string): Promise<boolean> => {
  try {
    // Usar função de validação segura do backend
    const { data: validationResult, error: validationError } = await supabase.rpc('secure_auth_attempt', {
      p_email: email,
      p_password: password,
      p_operation: 'signup',
      p_nome: nome,
      p_ip_address: 'client-side',
      p_user_agent: navigator.userAgent
    });

    if (validationError) {
      console.error("Erro na validação:", validationError);
      toast.error("Erro de validação", {
        description: "Erro interno de validação.",
      });
      return false;
    }

    const result = validationResult as { 
      success: boolean; 
      error?: string; 
      rate_limited?: boolean;
      sanitized_email?: string;
      sanitized_nome?: string;
      password_validation?: any;
    };
    
    if (!result.success) {
      if (result.rate_limited) {
        toast.error("Muitas tentativas de cadastro", {
          description: result.error || "Tente novamente em 15 minutos.",
        });
      } else if (result.password_validation) {
        toast.error("Senha fraca", {
          description: result.password_validation.errors?.join(', ') || result.error,
        });
      } else {
        toast.error("Falha na validação", {
          description: result.error || "Dados inválidos.",
        });
      }
      return false;
    }

    // Registrar com Supabase usando dados sanitizados
    const { error, data } = await supabase.auth.signUp({
      email: result.sanitized_email || email,
      password: password,
      options: {
        data: { nome: result.sanitized_nome || nome }
      }
    });

    if (error) {
      // Registrar falha de cadastro no backend
      await supabase.rpc('log_auth_attempt', {
        p_email: result.sanitized_email || email,
        p_operation: 'signup',
        p_success: false,
        p_error_message: error.message,
        p_ip_address: 'client-side',
        p_user_agent: navigator.userAgent
      });

      toast.error("Falha no cadastro", {
        description: error.message,
      });
      return false;
    }

    // Registrar cadastro bem-sucedido
    await supabase.rpc('log_auth_attempt', {
      p_email: result.sanitized_email || email,
      p_operation: 'signup',
      p_success: true,
      p_error_message: null,
      p_ip_address: 'client-side',
      p_user_agent: navigator.userAgent
    });

    await logAuditEvent("signup_success", { 
      email: result.sanitized_email || email, 
      nome: result.sanitized_nome || nome 
    }, data.user?.id);

    return true;
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar criar sua conta.",
    });
    return false;
  }
};