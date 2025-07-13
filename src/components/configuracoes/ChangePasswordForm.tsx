
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { checkPasswordStrength } from "@/services/auth/passwordUtils";
import { passwordSchema } from "@/services/auth/schemas";
import { z } from "zod";
import { PasswordInput } from "./password/PasswordInput";
import { PasswordStrengthIndicator } from "./password/PasswordStrengthIndicator";
import { PasswordRequirementsList } from "./password/PasswordRequirementsList";
import { PasswordFormAlerts } from "./password/PasswordFormAlerts";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<'fraca' | 'média' | 'forte' | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setGeneralError("Por favor, informe sua senha atual");
      isValid = false;
      return isValid;
    }

    // Validar nova senha
    try {
      passwordSchema.parse(newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validar confirmação de senha
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
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
      setSuccessMessage("Senha alterada com sucesso!");
      
      // Limpar campos após o sucesso
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Erro ao alterar senha", error);
      setGeneralError(error.message || "Ocorreu um erro ao alterar sua senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Alterar Senha
      </Button>
    </form>
  );
}
