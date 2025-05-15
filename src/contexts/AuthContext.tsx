
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Aqui verificaremos se há uma sessão ativa no Supabase
    // E carregaremos o usuário atualmente autenticado
    console.log("Verificando autenticação no supabase...");
    // Simulando carregamento para a demonstração
    const checkAuth = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(checkAuth);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Aqui iremos autenticar com Supabase
      console.log("Autenticando com", email);
      
      // Simulação para demonstração
      setTimeout(() => {
        setUser({
          id: "1",
          email,
          nome: "Usuário Demo"
        });
        setLoading(false);
      }, 1000);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema de gestão de clientes",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      setLoading(true);
      // Aqui iremos criar uma conta com Supabase
      console.log("Criando conta para", email);
      
      // Simulação para demonstração
      setTimeout(() => {
        setUser({
          id: "1",
          email,
          nome
        });
        setLoading(false);
      }, 1000);
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo ao sistema de gestão de clientes",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: "Verifique os dados informados e tente novamente",
        variant: "destructive",
      });
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    // Aqui iremos fazer logout no Supabase
    console.log("Realizando logout");
    
    // Simulação para demonstração
    setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
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
