
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { emailSchema, passwordSchema } from "./schemas";
import { checkRateLimit, clearLoginAttempts } from "./rateLimit";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";
import { sanitizeLoginData, sanitizeSignupData, sanitizeObject } from "./dataSanitization";
import { sanitizeLoginDataBackend, sanitizeSignupDataBackend } from "./backendSanitization";

// Login seguro com validações
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // Usar função de validação segura do backend
    const { data: validationResult, error: validationError } = await supabase.rpc('secure_auth_attempt', {
      p_email: email,
      p_password: password,
      p_operation: 'login',
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
    };
    
    if (!result.success) {
      if (result.rate_limited) {
        toast.error("Muitas tentativas de login", {
          description: result.error || "Tente novamente em 15 minutos.",
        });
      } else {
        toast.error("Falha na validação", {
          description: result.error || "Dados inválidos.",
        });
      }
      return false;
    }

    // Autenticar com Supabase usando dados sanitizados
    const { error, data } = await supabase.auth.signInWithPassword({
      email: result.sanitized_email || email,
      password: password,
    });

    if (error) {
      // Registrar falha de login no backend
      await supabase.rpc('log_auth_attempt', {
        p_email: result.sanitized_email || email,
        p_operation: 'login',
        p_success: false,
        p_error_message: error.message,
        p_ip_address: 'client-side',
        p_user_agent: navigator.userAgent
      });

      toast.error("Falha na autenticação", {
        description: error.message,
      });
      return false;
    }

    // Registrar login bem-sucedido
    await supabase.rpc('log_auth_attempt', {
      p_email: result.sanitized_email || email,
      p_operation: 'login',
      p_success: true,
      p_error_message: null,
      p_ip_address: 'client-side',
      p_user_agent: navigator.userAgent
    });

    await logAuditEvent("login_success", { email: result.sanitized_email || email }, data.user?.id);

    // Configurar expiração de sessão (8 horas)
    setupSessionExpiration(async () => {
      await supabase.auth.signOut();
      toast.warning("Sua sessão expirou", {
        description: "Por favor, faça login novamente.",
      });
    });

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar fazer login.",
    });
    return false;
  }
};

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

// Logout seguro
export const secureSignOut = async (): Promise<boolean> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    await supabase.auth.signOut();
    
    if (userId) {
      await logAuditEvent("logout_success", {}, userId);
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    toast.error("Erro ao sair", {
      description: "Ocorreu um erro ao tentar fazer logout.",
    });
    return false;
  }
};

// Função para encerrar todas as sessões (logout em todos os dispositivos)
export const signOutAll = async (): Promise<boolean> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    // Usar o scope global para encerrar todas as sessões
    await supabase.auth.signOut({ scope: 'global' });
    
    if (userId) {
      await logAuditEvent("logout_all_sessions", {}, userId);
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao encerrar todas as sessões:", error);
    toast.error("Erro ao sair", {
      description: "Ocorreu um erro ao tentar encerrar todas as sessões.",
    });
    return false;
  }
};

// Função para atualizar senha com validação
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Validar nova senha usando função do backend
    const { data: passwordValidation, error: validationError } = await supabase.rpc('validate_password_strength', {
      p_password: newPassword
    });

    if (validationError) {
      console.error("Erro na validação de senha:", validationError);
      toast.error("Erro de validação", {
        description: "Erro interno de validação de senha.",
      });
      return false;
    }

    const validation = passwordValidation as { 
      valid: boolean; 
      errors?: string[]; 
      warnings?: string[];
      strength?: string;
    };

    if (!validation.valid) {
      toast.error("Senha fraca", {
        description: validation.errors?.join(', ') || "Senha não atende aos critérios de segurança.",
      });
      return false;
    }

    // Mostrar avisos se houver
    if (validation.warnings && validation.warnings.length > 0) {
      toast.warning("Avisos sobre a senha", {
        description: validation.warnings.join(', '),
        duration: 4000,
      });
    }

    const { data, error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    if (error) {
      toast.error("Falha ao atualizar senha", {
        description: error.message,
      });
      await logAuditEvent("password_update_failed", { 
        error: error.message,
        password_strength: validation.strength 
      });
      return false;
    }

    // Registrar atualização de senha com detalhes da força
    await logAuditEvent("password_updated", { 
      password_strength: validation.strength,
      had_warnings: validation.warnings && validation.warnings.length > 0
    }, data.user?.id);
    
    toast.success("Senha atualizada", {
      description: `Sua senha foi atualizada com sucesso. Força: ${validation.strength}.`,
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar atualizar sua senha.",
    });
    return false;
  }
};
