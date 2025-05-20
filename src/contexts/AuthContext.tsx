
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { 
  secureSignIn, 
  secureSignOut, 
  secureSignUp, 
  signOutAll,
  updatePassword,
  logAuditEvent
} from "@/services/authService";

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

// Calcular hora de expiração da sessão (8 horas a partir de agora)
const calculateExpiryTime = (): Date => {
  return new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        if (currentSession && currentSession.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            nome: currentSession.user.user_metadata.nome
          });
          // Atualizar tempo de expiração da sessão
          setSessionExpiresAt(calculateExpiryTime());
        } else {
          setUser(null);
          setSessionExpiresAt(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession && currentSession.user) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email || "",
          nome: currentSession.user.user_metadata.nome
        });
        // Atualizar tempo de expiração da sessão
        setSessionExpiresAt(calculateExpiryTime());
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const success = await secureSignIn(email, password);
      
      if (!success) {
        setLoading(false);
        throw new Error("Falha na autenticação");
      }
      
      // O estado do usuário será atualizado pelo listener onAuthStateChange
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    setLoading(true);
    try {
      const success = await secureSignUp(email, password, nome);
      
      if (!success) {
        setLoading(false);
        throw new Error("Falha no cadastro");
      }
      
      // O estado do usuário será atualizado pelo listener onAuthStateChange
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await secureSignOut();
      // O estado do usuário será atualizado pelo listener onAuthStateChange
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao sair do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOutAllDevices = async () => {
    try {
      setLoading(true);
      await signOutAll();
      // O estado do usuário será atualizado pelo listener onAuthStateChange
    } catch (error: any) {
      toast({
        title: "Erro ao encerrar sessões",
        description: error.message || "Ocorreu um erro ao encerrar todas as sessões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await updatePassword(currentPassword, newPassword);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro ao atualizar sua senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signOutAllDevices,
        changePassword,
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
