
import { z } from "zod";

// Esquema de validação para senha flexível - apenas letras, números e mínimo 8 caracteres obrigatórios
export const passwordSchema = z.string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número");

// Esquema de validação para email
export const emailSchema = z.string()
  .email("Email inválido")
  .min(5, "Email muito curto")
  .max(100, "Email muito longo");
