
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

  // Função para converter SupabaseUser para User local
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '', // Garantir que email nunca seja undefined
      nome: supabaseUser.user_metadata?.nome || ''
    };
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ? convertSupabaseUser(session.user) : null);
      setLoading(false);
    };

    getSession();
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ? convertSupabaseUser(session.user) : null);
        setSession(session);
        setLoading(false);
        
        // Configurar timezone quando o usuário faz login
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await configureBackendTimezone();
        }
      }
    );

    return () => subscription.unsubscribe();
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
