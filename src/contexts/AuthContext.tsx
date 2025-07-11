
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { configureBackendTimezone } from "@/utils/backendTimezone";
import { secureSignIn, secureSignUp, updatePassword, secureSignOut } from "@/services/auth";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  changePassword: async () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para converter SupabaseUser para User local com validação
  const convertSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    
    try {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '', // Garantir que email nunca seja undefined
        nome: supabaseUser.user_metadata?.nome || ''
      };
    } catch (error) {
      console.error('Error converting supabase user:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ? convertSupabaseUser(session.user) : null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    getSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const success = await secureSignIn(email, password);
      if (!success) {
        throw new Error('Falha na autenticação');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    setLoading(true);
    try {
      const success = await secureSignUp(email, password, nome);
      if (!success) {
        throw new Error('Falha no cadastro');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const success = await updatePassword(currentPassword, newPassword);
      if (!success) {
        throw new Error('Falha ao alterar senha');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const success = await secureSignOut();
      if (success) {
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        try {
          if (mounted) {
            const convertedUser = session?.user ? convertSupabaseUser(session.user) : null;
            setUser(convertedUser);
            setSession(session);
            setLoading(false);
            
            // Configurar timezone quando o usuário faz login (não-bloqueante)
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
              // Usar setTimeout para não bloquear o fluxo principal
              setTimeout(() => {
                configureBackendTimezone().catch(error => {
                  console.warn('Error configuring backend timezone:', error);
                });
              }, 0);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          if (mounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextProps = {
    user,
    session,
    loading,
    signIn,
    signUp,
    changePassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
