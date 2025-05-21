
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FormField, GeneralErrorAlert } from "@/components/cadastro/FormField";
import { PasswordRequirements } from "@/components/cadastro/PasswordRequirements";
import { PasswordStrengthMeter } from "@/components/cadastro/PasswordStrengthMeter";
import { useCadastroForm } from "@/hooks/useCadastroForm";

const Cadastro = () => {
  const {
    nome,
    setNome,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    emailError,
    nomeError,
    generalError,
    passwordStrength,
    passwordFeedback,
    isLoading,
    handleSubmit,
  } = useCadastroForm();

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
            <GeneralErrorAlert error={generalError} />
            
            <FormField
              id="nome"
              label="Nome"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={nomeError}
            />
            
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />
            
            <FormField
              id="password"
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
            >
              {password && (
                <PasswordStrengthMeter 
                  passwordStrength={passwordStrength} 
                  passwordFeedback={passwordFeedback} 
                />
              )}
              <PasswordRequirements password={password} />
            </FormField>
            
            <FormField
              id="confirmPassword"
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passwordError}
            />
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
