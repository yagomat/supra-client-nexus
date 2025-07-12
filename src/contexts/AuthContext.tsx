
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { calculateExpiryTime } from "@/utils/authUtils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sessionExpiresAt: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  
  const authOperations = useAuthOperations();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, currentSession?.user?.id);
        
        setSession(currentSession);
        if (currentSession && currentSession.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            nome: currentSession.user.user_metadata.nome
          });
          // Calcular tempo de expiração baseado no token JWT
          setSessionExpiresAt(calculateExpiryTime(currentSession));
        } else {
          setUser(null);
          setSessionExpiresAt(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', currentSession?.user?.id);
      
      setSession(currentSession);
      if (currentSession && currentSession.user) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email || "",
          nome: currentSession.user.user_metadata.nome
        });
        // Calcular tempo de expiração baseado no token JWT
        setSessionExpiresAt(calculateExpiryTime(currentSession));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Use session monitoring hook
  useSessionMonitor(sessionExpiresAt, user, authOperations.signOut);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: authOperations.loading,
        signIn: authOperations.signIn,
        signUp: authOperations.signUp,
        signOut: authOperations.signOut,
        signOutAllDevices: authOperations.signOutAllDevices,
        changePassword: authOperations.changePassword,
        sessionExpiresAt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
