
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { emailSchema, passwordSchema } from "./schemas";
import { checkRateLimit, clearLoginAttempts } from "./rateLimit";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";

// Login seguro com validações
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    // Validar email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error("Email inválido", {
        description: emailResult.error.errors[0].message,
      });
      return false;
    }

    // Verificar rate limiting
    if (!checkRateLimit(email)) {
      toast.error("Muitas tentativas de login", {
        description: `Por favor, tente novamente após 15 minutos.`,
      });
      await logAuditEvent("login_rate_limit_exceeded", { email });
      return false;
    }

    // Autenticar com Supabase
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Falha na autenticação", {
        description: error.message,
      });
      await logAuditEvent("login_failed", { email, error: error.message });
      return false;
    }

    // Limpar tentativas de login em caso de sucesso
    clearLoginAttempts(email);
    
    // Registrar login bem-sucedido
    await logAuditEvent("login_success", { email }, data.user?.id);

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
    // Validar email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error("Email inválido", {
        description: emailResult.error.errors[0].message,
      });
      return false;
    }

    // Validar senha
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error("Senha fraca", {
        description: passwordResult.error.errors[0].message,
      });
      return false;
    }

    // Registrar com Supabase
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome }
      }
    });

    if (error) {
      toast.error("Falha no cadastro", {
        description: error.message,
      });
      await logAuditEvent("signup_failed", { email, nome, error: error.message });
      return false;
    }

    // Registrar cadastro bem-sucedido
    await logAuditEvent("signup_success", { email, nome }, data.user?.id);

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
    // Validar nova senha
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      toast.error("Senha fraca", {
        description: passwordResult.error.errors[0].message,
      });
      return false;
    }

    const { data, error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    if (error) {
      toast.error("Falha ao atualizar senha", {
        description: error.message,
      });
      await logAuditEvent("password_update_failed", { error: error.message });
      return false;
    }

    // Registrar atualização de senha
    await logAuditEvent("password_updated", {}, data.user?.id);
    
    toast.success("Senha atualizada", {
      description: "Sua senha foi atualizada com sucesso.",
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
