
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./auditLog";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

// Função para verificar rate limiting
export const checkRateLimit = async (email: string): Promise<boolean> => {
  const now = Date.now();
  
  try {
    // Buscar registro de tentativas no banco de dados
    const { data, error } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error("Erro ao verificar rate limit:", error);
      return true; // Em caso de erro, permitir o login (falha segura)
    }
    
    if (data) {
      // Verifica se o tempo de bloqueio passou
      if (now - data.timestamp > LOCKOUT_TIME) {
        // Reset de tentativas após o período de bloqueio
        await supabase
          .from('login_attempts')
          .update({ count: 1, timestamp: now })
          .eq('email', email);
        return true;
      }
      
      // Verifica se excedeu o número máximo de tentativas
      if (data.count >= MAX_LOGIN_ATTEMPTS) {
        return false;
      }
      
      // Incrementa o contador de tentativas
      await supabase
        .from('login_attempts')
        .update({ count: data.count + 1, timestamp: data.timestamp })
        .eq('email', email);
    } else {
      // Criar novo registro de tentativas
      await supabase
        .from('login_attempts')
        .insert({ email, count: 1, timestamp: now });
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar rate limit:", error);
    // Em caso de erro, permitir o login (falha segura)
    return true;
  }
};

// Função para limpar tentativas de login
export const clearLoginAttempts = async (email: string): Promise<void> => {
  try {
    await supabase
      .from('login_attempts')
      .delete()
      .eq('email', email);
  } catch (error) {
    console.error("Erro ao limpar tentativas de login:", error);
  }
};

// Função para bloquear IP após várias tentativas mal-sucedidas
export const checkIPRateLimit = async (ipAddress: string): Promise<boolean> => {
  const now = Date.now();
  
  try {
    // Buscar registro de tentativas por IP
    const { data, error } = await supabase
      .from('ip_rate_limits')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error("Erro ao verificar IP rate limit:", error);
      return true;
    }
    
    if (data) {
      // Verifica se o tempo de bloqueio passou
      if (now - data.timestamp > LOCKOUT_TIME) {
        await supabase
          .from('ip_rate_limits')
          .update({ count: 1, timestamp: now })
          .eq('ip_address', ipAddress);
        return true;
      }
      
      // Verifica se excedeu o número máximo de tentativas
      if (data.count >= MAX_LOGIN_ATTEMPTS * 2) { // IP rate limit é maior
        await logAuditEvent("ip_rate_limit_exceeded", { ip_address: ipAddress });
        return false;
      }
      
      // Incrementa o contador de tentativas
      await supabase
        .from('ip_rate_limits')
        .update({ count: data.count + 1 })
        .eq('ip_address', ipAddress);
    } else {
      // Criar novo registro
      await supabase
        .from('ip_rate_limits')
        .insert({ ip_address: ipAddress, count: 1, timestamp: now });
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar IP rate limit:", error);
    return true;
  }
};
