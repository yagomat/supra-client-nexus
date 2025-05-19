
import { z } from "zod";

export const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().optional(),
  uf: z.string().optional(),
  servidor: z.string().min(1, "Servidor é obrigatório"),
  dia_vencimento: z
    .number()
    .int("Dia deve ser um número inteiro")
    .min(1, "Dia deve ser entre 1 e 31")
    .max(31, "Dia deve ser entre 1 e 31"),
  valor_plano: z.number().nonnegative("Valor deve ser positivo").optional(),
  
  // Removendo a obrigatoriedade dos campos de usuário e senha
  dispositivo_smart: z.string().optional(),
  aplicativo: z.string().min(1, "Aplicativo é obrigatório"),
  usuario_aplicativo: z.string().optional(),
  senha_aplicativo: z.string().optional(),
  data_licenca_aplicativo: z.string().optional(),
  
  possui_tela_adicional: z.boolean().default(false),
  dispositivo_smart_2: z.string().optional(),
  aplicativo_2: z.string().optional(),
  usuario_2: z.string().optional(),
  senha_2: z.string().optional(),
  data_licenca_2: z.string().optional(),
  
  observacoes: z.string().optional(),
  status: z.string().optional(),
});

export type ClienteFormValues = z.infer<typeof formSchema>;
