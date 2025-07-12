
import { passwordSchema } from "./schemas";

// Função para verificar força da senha (alinhada com nova lógica flexível)
export const checkPasswordStrength = (password: string): {
  strength: 'fraca' | 'média' | 'forte';
  feedback: string;
} => {
  let strength: 'fraca' | 'média' | 'forte' = 'fraca';
  let feedback = '';

  // Verificar comprimento mínimo (obrigatório)
  if (password.length < 8) {
    feedback = 'A senha deve ter pelo menos 8 caracteres.';
    return { strength, feedback };
  }

  // Verificar requisitos obrigatórios
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  // Se não atende aos requisitos básicos obrigatórios
  if (!hasLetter || !hasNumber) {
    strength = 'fraca';
    if (!hasLetter && !hasNumber) {
      feedback = 'A senha deve conter pelo menos uma letra e um número.';
    } else if (!hasLetter) {
      feedback = 'A senha deve conter pelo menos uma letra.';
    } else {
      feedback = 'A senha deve conter pelo menos um número.';
    }
    return { strength, feedback };
  }

  // Verificar elementos opcionais para determinar força
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 12;

  // Contar elementos opcionais presentes
  const optionalElements = [hasUpperCase, hasSpecialChars, isLongEnough].filter(Boolean).length;

  // Determinar força baseada nos elementos opcionais
  if (optionalElements >= 2) {
    strength = 'forte';
    feedback = 'Senha forte!';
  } else if (optionalElements === 1) {
    strength = 'média';
    feedback = 'Senha média. Para torná-la mais forte, adicione maiúsculas, símbolos ou mais caracteres.';
  } else {
    strength = 'média';
    feedback = 'Senha válida. Recomenda-se adicionar letras maiúsculas e símbolos para maior segurança.';
  }

  return { strength, feedback };
};
