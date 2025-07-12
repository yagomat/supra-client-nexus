
import { useEffect } from "react";
import { isSessionValid } from "@/utils/authUtils";

export const useSessionMonitor = (
  sessionExpiresAt: Date | null,
  user: any,
  signOut: () => Promise<void>
) => {
  // Auto logout silencioso apenas quando a sessão realmente expira
  useEffect(() => {
    if (!sessionExpiresAt || !user) return;

    const checkSessionValidity = () => {
      if (!isSessionValid(sessionExpiresAt)) {
        console.log('Sessão expirada, fazendo logout automático');
        signOut();
      }
    };

    // Verificar a cada 5 minutos se a sessão ainda é válida
    const interval = setInterval(checkSessionValidity, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [sessionExpiresAt, user, signOut]);
};
