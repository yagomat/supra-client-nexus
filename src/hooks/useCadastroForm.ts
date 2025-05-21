
import { useState, useEffect } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { emailSchema, passwordSchema } from "@/services/auth/schemas";
import { checkPasswordStrength } from "@/services/auth/passwordUtils";
import { sanitizeInput } from "@/services/auth/dataSanitization";

export const useCadastroForm = () => {
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

  return {
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
  };
};
