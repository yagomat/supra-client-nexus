
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Login simplificado sem auditoria
export const secureSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log("=== INICIANDO LOGIN ===");
    console.log("Email:", email.toLowerCase().trim());
    
    // Fazer login diretamente com Supabase
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    console.log("Resultado do login:", { error: error?.message, user: data.user?.id });

    if (error) {
      console.error("Erro de autenticação:", error.message);
      toast.error("Credenciais inválidas", {
        description: "Verifique seu email e senha.",
      });
      return false;
    }

    if (!data.user) {
      console.error("Usuário não retornado após login");
      toast.error("Erro no login", {
        description: "Tente novamente.",
      });
      return false;
    }

    console.log("=== LOGIN REALIZADO COM SUCESSO ===");
    toast.success("Login realizado com sucesso!");
    return true;
    
  } catch (error) {
    console.error("Erro inesperado no login:", error);
    
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar fazer login.",
    });
    return false;
  }
};
