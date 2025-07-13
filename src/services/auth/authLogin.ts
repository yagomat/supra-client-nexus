
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";

// Login seguro simplificado
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('secureSignIn: Iniciando login para', email);

    // Autenticar diretamente com Supabase
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    // Registrar tentativa de login
    await logAuditEvent("auth_login_attempt", { 
      email: email.toLowerCase().trim(), 
      success: !error, 
      error: error?.message || null,
      user_id: data.user?.id || null,
      timestamp: new Date().toISOString()
    }, data.user?.id);

    if (error) {
      console.error('Erro na autenticação:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error("Credenciais inválidas", {
          description: "Email ou senha incorretos.",
        });
      } else if (error.message.includes('Email not confirmed')) {
        toast.error("Email não confirmado", {
          description: "Verifique seu email e confirme sua conta.",
        });
      } else {
        toast.error("Erro na autenticação", {
          description: error.message,
        });
      }
      return false;
    }

    console.log('Login bem-sucedido para:', email);

    // Registrar login bem-sucedido
    await logAuditEvent("login_success", { 
      email: email.toLowerCase().trim(),
      user_id: data.user?.id,
      timestamp: new Date().toISOString()
    }, data.user?.id);

    // Configurar expiração de sessão
    setupSessionExpiration(async () => {
      await supabase.auth.signOut();
      toast.warning("Sua sessão expirou", {
        description: "Por favor, faça login novamente.",
      });
    });

    toast.success("Login realizado com sucesso!", {
      description: "Bem-vindo de volta!",
    });

    return true;
  } catch (error) {
    console.error("Erro inesperado ao fazer login:", error);
    
    // Registrar erro inesperado
    await logAuditEvent("auth_login_attempt", { 
      email: email.toLowerCase().trim(), 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar fazer login.",
    });
    return false;
  }
};
