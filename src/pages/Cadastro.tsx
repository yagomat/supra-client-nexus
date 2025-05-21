import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkPasswordStrength } from "@/services/auth/passwordUtils";
import { emailSchema, passwordSchema } from "@/services/auth/schemas";
import { sanitizeInput } from "@/services/auth/dataSanitization";
import { z } from "zod";

const Cadastro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nomeError, setNomeError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<'fraca' | 'média' | 'forte' | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Limpar erros quando o usuário digita
  useEffect(() => {
    if (emailError && email) setEmailError("");
    if (nomeError && nome) setNomeError("");
    if (passwordError && password) setPasswordError("");
    if (generalError) setGeneralError("");
  }, [email, nome, password, confirmPassword]);

  // Verificar força da senha quando ela muda
  useEffect(() => {
    if (password) {
      const { strength, feedback } = checkPasswordStrength(password);
      setPasswordStrength(strength);
      setPasswordFeedback(feedback);
    } else {
      setPasswordStrength(null);
      setPasswordFeedback("");
    }
  }, [password]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validar nome
    if (!nome.trim()) {
      setNomeError("Nome é obrigatório");
      isValid = false;
    }

    // Validar email
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validar senha
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validar confirmação de senha
    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setGeneralError("");
    setEmailError("");
    setNomeError("");
    setPasswordError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Sanitizando os dados antes de enviar
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedNome = sanitizeInput(nome);
      
      // Não sanitizamos a senha para não interferir no hash
      await signUp(sanitizedEmail || "", password, sanitizedNome || "");
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao criar conta", error);
      setGeneralError(error.message || "Ocorreu um erro ao criar sua conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para criar sua conta
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
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="nome"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className={nomeError ? "border-destructive" : ""}
              />
              {nomeError && (
                <p className="text-sm text-destructive">{nomeError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
                className={passwordError ? "border-destructive" : ""}
              />
              {password && passwordStrength && (
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
                  {/[A-Z]/.test(password) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos uma letra maiúscula</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {/[a-z]/.test(password) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos uma letra minúscula</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {/[0-9]/.test(password) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos um número</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {/[^A-Za-z0-9]/.test(password) ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span>Pelo menos um caractere especial</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {password.length >= 8 ? (
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
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
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
              Criar Conta
            </Button>
            <div className="text-center text-sm">
              Já possui uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Cadastro;
