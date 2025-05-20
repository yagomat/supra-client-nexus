
import { passwordSchema } from "./schemas";

// Função para verificar força da senha (para uso no frontend)
export const checkPasswordStrength = (password: string): {
  strength: 'fraca' | 'média' | 'forte';
  feedback: string;
} => {
  let strength: 'fraca' | 'média' | 'forte' = 'fraca';
  let feedback = '';

  // Verificar comprimento
  if (password.length < 8) {
    feedback = 'A senha deve ter pelo menos 8 caracteres.';
    return { strength, feedback };
  }

  // Verificar requisitos
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  const passedChecks = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (passedChecks <= 2) {
    strength = 'fraca';
    feedback = 'Senha fraca. Adicione letras maiúsculas, minúsculas, números e símbolos.';
  } else if (passedChecks === 3) {
    strength = 'média';
    feedback = 'Senha média. Adicione mais variedade de caracteres para torná-la mais forte.';
  } else {
    strength = 'forte';
    feedback = 'Senha forte!';
  }

  return { strength, feedback };
};
