
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { emailSchema } from "@/services/auth/schemas";
import { useToast } from "@/hooks/use-toast";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Limpar erros quando o usuário digita
  useEffect(() => {
    if (emailError && email) setEmailError("");
    if (generalError) setGeneralError("");
  }, [email, password, emailError, generalError]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validar email
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validar se a senha foi fornecida
    if (!password) {
      setGeneralError("Por favor, informe sua senha.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setGeneralError("");
    setEmailError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      console.log('Tentando fazer login com:', email);
      
      // Usar diretamente o signIn do contexto que já tem toda a lógica de segurança
      await signIn(email, password);
      
      console.log('Login realizado com sucesso');
      
      // Verificar se há um redirect específico
      const from = (location.state as any)?.from || "/dashboard";
      navigate(from);
      
    } catch (error) {
      console.error("Erro ao fazer login", error);
      
      // Tratamento de erro mais específico
      if (error instanceof Error) {
        if (error.message.includes('Rate limit') || error.message.includes('Muitas tentativas')) {
          setGeneralError("Muitas tentativas de login. Aguarde alguns minutos e tente novamente.");
        } else if (error.message.includes('Invalid login credentials')) {
          setGeneralError("Email ou senha incorretos. Verifique seus dados e tente novamente.");
        } else {
          setGeneralError("Erro ao fazer login. Verifique seus dados e tente novamente.");
        }
      } else {
        setGeneralError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    emailError,
    generalError,
    handleSubmit,
  };
};
