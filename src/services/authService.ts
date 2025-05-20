
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Contador para tentativas de login
const loginAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

// Esquema de validação para senha forte
export const passwordSchema = z.string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial");

// Esquema de validação para email
export const emailSchema = z.string()
  .email("Email inválido")
  .min(5, "Email muito curto")
  .max(100, "Email muito longo");

// Função para verificar rate limiting
const checkRateLimit = (email: string): boolean => {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (attempt) {
    // Verifica se o tempo de bloqueio passou
    if (now - attempt.timestamp > LOCKOUT_TIME) {
      loginAttempts.set(email, { count: 1, timestamp: now });
      return true;
    }

    // Verifica se excedeu o número máximo de tentativas
    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      return false;
    }

    // Incrementa o contador de tentativas
    loginAttempts.set(email, { count: attempt.count + 1, timestamp: attempt.timestamp });
  } else {
    loginAttempts.set(email, { count: 1, timestamp: now });
  }

  return true;
};

// Registrar evento de auditoria
export const logAuditEvent = async (
  event: string,
  details: Record<string, any>,
  userId?: string
): Promise<void> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const userIdToLog = userId || currentUser.user?.id;
    
    if (!userIdToLog) return;

    const { error } = await supabase.from("audit_logs").insert({
      user_id: userIdToLog,
      event_type: event,
      details,
      ip_address: "client-side", // Em produção, isso seria capturado pelo Edge Function
      user_agent: navigator.userAgent,
    });

    if (error) {
      console.error("Erro ao registrar evento de auditoria:", error);
    }
  } catch (error) {
    console.error("Erro ao registrar evento de auditoria:", error);
  }
};

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
    loginAttempts.delete(email);
    
    // Registrar login bem-sucedido
    await logAuditEvent("login_success", { email }, data.user?.id);

    // Configurar expiração de sessão (8 horas)
    setTimeout(async () => {
      await supabase.auth.signOut();
      toast.warning("Sua sessão expirou", {
        description: "Por favor, faça login novamente.",
      });
    }, 8 * 60 * 60 * 1000);

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

// Verificar força da senha (para uso no frontend)
export const checkPasswordStrength = (password: string): {
  strength: 'fraca' | 'média' | 'forte';
  feedback: string;
} => {
  let strength = 'fraca';
  let feedback = '';

  // Verificar comprimento
  if (password.length < 8) {
    feedback = 'A senha deve ter pelo menos 8 caracteres.';
    return { strength, feedback };
  }

  // Verificar requisitos
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  const passedChecks = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (passedChecks <= 2) {
    strength = 'fraca';
    feedback = 'Senha fraca. Adicione letras maiúsculas, minúsculas, números e símbolos.';
  } else if (passedChecks === 3) {
    strength = 'média';
    feedback = 'Senha média. Adicione mais variedade de caracteres para torná-la mais forte.';
  } else {
    strength = 'forte';
    feedback = 'Senha forte!';
  }

  return { strength, feedback };
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
