
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkPasswordStrength } from "@/services/auth/passwordUtils";
import { passwordSchema } from "@/services/auth/schemas";
import { z } from "zod";

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
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="default" className="bg-green-50 border-green-500">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Senha Atual
        </label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          maxLength={50}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          Nova Senha
        </label>
        <div>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            maxLength={50}
            className={passwordError ? "border-destructive" : ""}
          />
          <div className="text-xs text-gray-500 text-right mt-0.5">
            {newPassword.length}/50
          </div>
        </div>
        
        {newPassword && passwordStrength && (
          <div className="flex items-center space-x-2 text-sm">
            <div 
              className={`h-2 w-full rounded ${
                passwordStrength === 'fraca' 
                  ? 'bg-red-500' 
                  : passwordStrength === 'média' 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
            />
            <span>{passwordFeedback}</span>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            {/[a-zA-Z]/.test(newPassword) ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <X size={16} className="text-red-500" />
            )}
            <span className={/[a-zA-Z]/.test(newPassword) ? "text-green-700" : "text-red-600"}>
              Pelo menos uma letra (obrigatório)
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {/[0-9]/.test(newPassword) ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <X size={16} className="text-red-500" />
            )}
            <span className={/[0-9]/.test(newPassword) ? "text-green-700" : "text-red-600"}>
              Pelo menos um número (obrigatório)
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {newPassword.length >= 8 ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <X size={16} className="text-red-500" />
            )}
            <span className={newPassword.length >= 8 ? "text-green-700" : "text-red-600"}>
              Mínimo de 8 caracteres (obrigatório)
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {/[A-Z]/.test(newPassword) ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <X size={16} className="text-gray-400" />
            )}
            <span className={/[A-Z]/.test(newPassword) ? "text-green-700" : "text-gray-500"}>
              Pelo menos uma letra maiúscula (recomendado)
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {/[^A-Za-z0-9]/.test(newPassword) ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <X size={16} className="text-gray-400" />
            )}
            <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-700" : "text-gray-500"}>
              Pelo menos um caractere especial (recomendado)
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar Nova Senha
        </label>
        <div>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            maxLength={50}
            className={passwordError ? "border-destructive" : ""}
          />
          <div className="text-xs text-gray-500 text-right mt-0.5">
            {confirmPassword.length}/50
          </div>
        </div>
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
