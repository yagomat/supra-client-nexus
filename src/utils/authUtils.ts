
import { Session } from "@supabase/supabase-js";

// Calcular hora de expiração da sessão baseada no token JWT
export const calculateExpiryTime = (session: Session | null): Date | null => {
  if (!session) return null;
  
  // Usar a expiração do token JWT se disponível
  if (session.expires_at) {
    return new Date(session.expires_at * 1000);
  }
  
  // Fallback para 24 horas se não houver informação (período mais longo)
  return new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
};

// Verificar se a sessão está válida
export const isSessionValid = (sessionExpiresAt: Date | null): boolean => {
  if (!sessionExpiresAt) return false;
  
  const now = new Date();
  const timeLeft = sessionExpiresAt.getTime() - now.getTime();
  
  return timeLeft > 0;
};
