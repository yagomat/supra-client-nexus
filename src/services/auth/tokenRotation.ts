
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Intervalo para verificar o token JWT (a cada 15 minutos)
const JWT_CHECK_INTERVAL = 15 * 60 * 1000;

// Período de validade do token antes de sugerir renovação (6 horas)
const TOKEN_RENEWAL_THRESHOLD = 6 * 60 * 60 * 1000;

/**
 * Configura o verificador de expiração e renovação de token JWT
 * @returns Função para limpar o temporizador
 */
export const setupTokenRotation = (): () => void => {
  // Iniciar verificação periódica
  const intervalId = setInterval(async () => {
    try {
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      // Se não há sessão, não fazer nada
      if (!session) return;
      
      // Verificar quando o token expira
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      
      // Se o token expira em menos do que o threshold, renovar
      if (expiresAt.getTime() - now.getTime() < TOKEN_RENEWAL_THRESHOLD) {
        await supabase.auth.refreshSession();
        console.log("Token JWT renovado automaticamente");
      }
    } catch (error) {
      console.error("Erro ao verificar/renovar token JWT:", error);
    }
  }, JWT_CHECK_INTERVAL);
  
  // Retornar função de limpeza
  return () => clearInterval(intervalId);
};

/**
 * Força a renovação do token JWT atual
 * @returns Promise que resolve quando o token for renovado
 */
export const forceTokenRefresh = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Erro ao renovar token:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return false;
  }
};
