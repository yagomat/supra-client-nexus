import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";

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