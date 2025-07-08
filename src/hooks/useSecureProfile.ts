import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProfileData {
  nome: string;
  telefone?: string;
}

export const useSecureProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateProfile = async (data: ProfileData) => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    setIsUpdating(true);
    
    try {
      // Usar função segura do backend com validação e auditoria
      const { data: result, error } = await supabase.rpc('secure_update_profile', {
        p_user_id: user.id,
        p_nome: data.nome,
        p_telefone: data.telefone || null
      });

      if (error) {
        console.error("Erro RPC:", error);
        throw error;
      }

      const typedResult = result as unknown as { 
        success: boolean; 
        error?: string; 
        validation?: { errors: string[]; warnings: string[] }; 
        message?: string 
      };
      
      if (!typedResult.success) {
        if (typedResult.error?.includes('Limite de')) {
          throw new Error(`Rate limit: ${typedResult.error}`);
        } else if (typedResult.validation?.errors?.length > 0) {
          throw new Error(`Validação: ${typedResult.validation.errors.join(', ')}`);
        } else {
          throw new Error(typedResult.error || 'Erro desconhecido');
        }
      }

      // Atualizar nome no auth metadata apenas se a validação passou
      if (data.nome && data.nome !== user.nome) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { nome: data.nome }
        });

        if (authError) {
          console.warn("Erro ao atualizar metadata auth:", authError);
          // Não falha completamente, pois o perfil já foi atualizado
        }
      }

      // Mostrar avisos de validação se houver
      if (typedResult.validation?.warnings?.length > 0) {
        toast({
          title: "Perfil atualizado com avisos",
          description: `${typedResult.message || "Dados salvos com sucesso"}. Avisos: ${typedResult.validation.warnings.join(', ')}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Perfil atualizado",
          description: typedResult.message || "Suas informações foram salvas com sucesso.",
        });
      }

      return typedResult;

    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.message?.includes('Rate limit:')) {
        toast({
          title: "Limite excedido",
          description: "Muitas atualizações em pouco tempo. Aguarde alguns minutos.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Validação:')) {
        toast({
          title: "Erro de validação",
          description: error.message.replace('Validação: ', ''),
          variant: "destructive",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: error.message || "Não foi possível atualizar o perfil",
        });
      }
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    isUpdating
  };
};