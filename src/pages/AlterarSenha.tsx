
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkPasswordStrength, passwordSchema } from "@/services/authService";
import { z } from "zod";

const AlterarSenha = () => {
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
  const navigate = useNavigate();

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
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao alterar senha", error);
      setGeneralError(error.message || "Ocorreu um erro ao alterar sua senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Alterar Senha</CardTitle>
          <CardDescription>
            Escolha uma nova senha para sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Nova Senha
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={passwordError ? "border-destructive" : ""}
              />
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
                  {/[A-Z]/.test(newPassword) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos uma letra maiúscula</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {/[a-z]/.test(newPassword) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos uma letra minúscula</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {/[0-9]/.test(newPassword) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos um número</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {/[^A-Za-z0-9]/.test(newPassword) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos um caractere especial</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {newPassword.length >= 8 ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Mínimo de 8 caracteres</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Nova Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={passwordError ? "border-destructive" : ""}
              />
              {passwordError && (
                <p className="text-destructive text-sm">{passwordError}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar Senha
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AlterarSenha;
