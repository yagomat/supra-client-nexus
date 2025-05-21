
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { emailSchema } from "@/services/auth/schemas";
import { sanitizeInput } from "@/services/auth/dataSanitization";
import { useToast } from "@/components/ui/use-toast";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
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
      
      // Sanitizando os dados antes de enviar
      const sanitizedEmail = sanitizeInput(email);
      
      // Não sanitizamos a senha para não interferir no hash
      await signIn(sanitizedEmail || "", password);
      
      // Usar navigate em vez de window.location para evitar recarregar a página
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login", error);
      setGeneralError("Verifique seu e-mail e senha e tente novamente.");
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
