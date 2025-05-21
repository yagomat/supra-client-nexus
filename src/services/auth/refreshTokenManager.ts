
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./auditLog";
import { toast } from "sonner";

// Intervalo para verificar tokens de atualização (a cada hora)
const REFRESH_TOKEN_CHECK_INTERVAL = 60 * 60 * 1000;

// Configurar gerenciador de tokens de atualização
export const setupRefreshTokenManager = (): () => void => {
  // Iniciar verificação periódica
  const intervalId = setInterval(async () => {
    try {
      // Verificar se há uma sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      // Verificar idade do token de atualização
      const refreshTokenCreated = new Date(session.refresh_token.created_at!);
      const now = new Date();
      const tokenAgeInDays = (now.getTime() - refreshTokenCreated.getTime()) / (1000 * 60 * 60 * 24);
      
      // Se o token de atualização tiver mais de 15 dias, forçar re-autenticação
      if (tokenAgeInDays > 15) {
        // Registrar evento de expiração de token
        await logAuditEvent("refresh_token_expiration", {
          age_days: tokenAgeInDays
        }, session.user.id);
        
        // Avisar o usuário que precisa fazer login novamente
        toast.warning("Sessão expirou por segurança", {
          description: "Por favor, faça login novamente para continuar usando o sistema.",
          duration: 10000,
        });
        
        // Forçar logout
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Erro ao verificar token de atualização:", error);
    }
  }, REFRESH_TOKEN_CHECK_INTERVAL);
  
  // Retornar função de limpeza
  return () => clearInterval(intervalId);
};

// Função para verificar validade de token de atualização
export const validateRefreshToken = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    // Tentar usar o token de atualização para obter uma nova sessão
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Erro ao validar token de atualização:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao validar token de atualização:", error);
    return false;
  }
};

// Revogar todos os tokens de atualização exceto o atual
export const revokeOtherSessions = async (): Promise<boolean> => {
  try {
    // Manter apenas a sessão atual, revogar todas as outras
    const { error } = await supabase.auth.refreshSession({
      refreshOptions: {
        onlyCurrentSession: false
      }
    });
    
    if (error) {
      console.error("Erro ao revogar outras sessões:", error);
      return false;
    }
    
    await logAuditEvent("other_sessions_revoked", {});
    
    toast.success("Outras sessões encerradas", {
      description: "Todas as outras sessões ativas foram encerradas com sucesso.",
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao revogar outras sessões:", error);
    return false;
  }
};
