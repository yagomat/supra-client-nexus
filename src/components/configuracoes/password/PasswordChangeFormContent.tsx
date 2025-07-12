
import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { checkPasswordStrength } from "@/services/auth/passwordUtils";
import { passwordSchema } from "@/services/auth/schemas";
import { z } from "zod";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { PasswordRequirementsList } from "./PasswordRequirementsList";
import { PasswordFormAlerts } from "./PasswordFormAlerts";

interface PasswordChangeFormContentProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onGeneralError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function PasswordChangeFormContent({ 
  onSuccess, 
  onError, 
  onGeneralError, 
  isLoading, 
  setIsLoading 
}: PasswordChangeFormContentProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<'fraca' | 'média' | 'forte' | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const { changePassword } = useAuth();

  // Limpar erros quando o usuário digita
  useEffect(() => {
    if (passwordError && newPassword) setPasswordError("");
    if (generalError) setGeneralError("");
    if (successMessage) setSuccessMessage("");
  }, [currentPassword, newPassword, confirmPassword]);

  // Verificar força da senha quando ela muda
  useEffect(() => {
    if (newPassword) {
      const { strength, feedback } = checkPasswordStrength(newPassword);
      setPasswordStrength(strength);
      setPasswordFeedback(feedback);
    } else {
      setPasswordStrength(null);
      setPasswordFeedback("");
    }
  }, [newPassword]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validar senha atual
    if (!currentPassword) {
      const error = "Por favor, informe sua senha atual";
      setGeneralError(error);
      onGeneralError(error);
      isValid = false;
      return isValid;
    }

    // Validar nova senha
    try {
      passwordSchema.parse(newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMsg = error.errors[0].message;
        setPasswordError(errorMsg);
        onError(errorMsg);
        isValid = false;
      }
    }

    // Validar confirmação de senha
    if (newPassword !== confirmPassword) {
      const error = "As senhas não coincidem";
      setPasswordError(error);
      onError(error);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setGeneralError("");
    setPasswordError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await changePassword(currentPassword, newPassword);
      const successMsg = "Senha alterada com sucesso!";
      setSuccessMessage(successMsg);
      onSuccess();
      
      // Limpar campos após o sucesso
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Erro ao alterar senha", error);
      const errorMsg = error.message || "Ocorreu um erro ao alterar sua senha.";
      setGeneralError(errorMsg);
      onGeneralError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <PasswordFormAlerts 
          generalError={generalError}
          successMessage={successMessage}
        />
        
        <PasswordInput
          id="currentPassword"
          label="Senha Atual"
          placeholder="••••••••"
          value={currentPassword}
          onChange={setCurrentPassword}
          required
        />
        
        <div className="space-y-2">
          <PasswordInput
            id="newPassword"
            label="Nova Senha"
            placeholder="••••••••"
            value={newPassword}
            onChange={setNewPassword}
            error={!!passwordError}
            required
          />
          
          <PasswordStrengthIndicator
            password={newPassword}
            strength={passwordStrength}
            feedback={passwordFeedback}
          />
          
          <PasswordRequirementsList password={newPassword} />
        </div>
        
        <div className="space-y-2">
          <PasswordInput
            id="confirmPassword"
            label="Confirmar Nova Senha"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={!!passwordError}
            required
          />
          {passwordError && (
            <p className="text-destructive text-sm">{passwordError}</p>
          )}
        </div>
      </CardContent>
    </form>
  );
}
