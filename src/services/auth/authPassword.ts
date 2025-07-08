import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";

// Função para atualizar senha com validação
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Validar nova senha usando função do backend
    const { data: passwordValidation, error: validationError } = await supabase.rpc('validate_password_strength', {
      p_password: newPassword
    });

    if (validationError) {
      console.error("Erro na validação de senha:", validationError);
      toast.error("Erro de validação", {
        description: "Erro interno de validação de senha.",
      });
      return false;
    }

    const validation = passwordValidation as { 
      valid: boolean; 
      errors?: string[]; 
      warnings?: string[];
      strength?: string;
    };

    if (!validation.valid) {
      toast.error("Senha fraca", {
        description: validation.errors?.join(', ') || "Senha não atende aos critérios de segurança.",
      });
      return false;
    }

    // Mostrar avisos se houver
    if (validation.warnings && validation.warnings.length > 0) {
      toast.warning("Avisos sobre a senha", {
        description: validation.warnings.join(', '),
        duration: 4000,
      });
    }

    const { data, error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    if (error) {
      toast.error("Falha ao atualizar senha", {
        description: error.message,
      });
      await logAuditEvent("password_update_failed", { 
        error: error.message,
        password_strength: validation.strength 
      });
      return false;
    }

    // Registrar atualização de senha com detalhes da força
    await logAuditEvent("password_updated", { 
      password_strength: validation.strength,
      had_warnings: validation.warnings && validation.warnings.length > 0
    }, data.user?.id);
    
    toast.success("Senha atualizada", {
      description: `Sua senha foi atualizada com sucesso. Força: ${validation.strength}.`,
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    toast.error("Erro inesperado", {
      description: "Ocorreu um erro ao tentar atualizar sua senha.",
    });
    return false;
  }
};