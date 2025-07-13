
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  secureSignIn, 
  secureSignOut, 
  secureSignUp, 
  signOutAll,
  updatePassword
} from "@/services/auth";

export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const success = await secureSignIn(email, password);
      
      if (!success) {
        throw new Error("Falha na autenticação");
      }
      
      // O estado do usuário será atualizado pelo listener onAuthStateChange
      // Não resetamos o loading aqui pois ele será resetado no AuthContext
    } catch (error: any) {
      setLoading(false);
      throw error;
    } finally {
      // Resetar loading após um pequeno delay para garantir que o AuthContext processou a mudança
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    setLoading(true);
    try {
      const success = await secureSignUp(email, password, nome);
      
      if (!success) {
        throw new Error("Falha no cadastro");
      }
      
      // O estado do usuário será atualizado pelo listener onAuthStateChange
      // Não resetamos o loading aqui pois ele será resetado no AuthContext
    } catch (error: any) {
      setLoading(false);
      throw error;
    } finally {
      // Resetar loading após um pequeno delay para garantir que o AuthContext processou a mudança
      setTimeout(() => {
        setLoading(false);
      }, 100);
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

  return {
    loading,
    signIn,
    signUp,
    signOut,
    signOutAllDevices,
    changePassword
  };
};
