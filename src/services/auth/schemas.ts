
import { z } from "zod";

// Esquema de validação para senha forte
export const passwordSchema = z.string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial");

// Esquema de validação para email
export const emailSchema = z.string()
  .email("Email inválido")
  .min(5, "Email muito curto")
  .max(100, "Email muito longo");
