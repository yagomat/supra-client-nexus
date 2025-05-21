
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./auditLog";
import { toast } from "sonner";

// Verificar se há atividades suspeitas na conta
export const checkSuspiciousActivity = async (userId: string): Promise<boolean> => {
  try {
    // Obter logs de auditoria recentes do usuário
    const { data, error } = await supabase.rpc('check_suspicious_activity', {
      p_user_id: userId
    });
    
    if (error) {
      console.error("Erro ao verificar atividades suspeitas:", error);
      return false;
    }
    
    if (data.is_suspicious) {
      // Registrar e notificar sobre atividade suspeita
      await logAuditEvent('suspicious_activity_detected', data.details, userId);
      
      toast.warning("Atividade suspeita detectada", {
        description: "Detectamos um padrão de uso incomum na sua conta. Por favor, revise seus acessos recentes.",
        duration: 10000,
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao verificar atividades suspeitas:", error);
    return false;
  }
};

// Verificar tentativas de login de localizações diferentes
export const checkLocationChange = async (userId: string, ipAddress: string): Promise<void> => {
  try {
    const { data, error } = await supabase.rpc('check_location_change', {
      p_user_id: userId,
      p_ip_address: ipAddress
    });
    
    if (error) {
      console.error("Erro ao verificar mudança de localização:", error);
      return;
    }
    
    if (data.is_new_location) {
      await logAuditEvent('new_location_login', { 
        ip: ipAddress, 
        previous_location: data.previous_location 
      }, userId);
      
      toast.info("Novo local de acesso detectado", {
        description: "Detectamos que você está acessando de um local diferente do usual.",
        duration: 8000,
      });
    }
  } catch (error) {
    console.error("Erro ao verificar mudança de localização:", error);
  }
};

// Verificar tentativas de acesso em horários incomuns
export const checkUnusualLoginTime = async (userId: string): Promise<void> => {
  const currentHour = new Date().getHours();
  
  try {
    const { data, error } = await supabase.rpc('check_unusual_login_time', {
      p_user_id: userId,
      p_current_hour: currentHour
    });
    
    if (error) {
      console.error("Erro ao verificar horário de acesso:", error);
      return;
    }
    
    if (data.is_unusual_time) {
      await logAuditEvent('unusual_login_time', { 
        hour: currentHour,
        usual_hours: data.usual_hours
      }, userId);
      
      toast.info("Acesso em horário incomum", {
        description: "Você está acessando o sistema em um horário diferente do seu padrão habitual.",
        duration: 5000,
      });
    }
  } catch (error) {
    console.error("Erro ao verificar horário de acesso:", error);
  }
};
