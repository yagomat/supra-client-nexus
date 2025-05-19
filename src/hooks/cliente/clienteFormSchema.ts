
import { z } from "zod";

// Definição do esquema do formulário
export const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }).max(40, { message: "O nome deve ter no máximo 40 caracteres" }),
  telefone: z.string().max(11).optional(),
  uf: z.string().max(2, { message: "UF deve ter no máximo 2 caracteres" }).optional(),
  servidor: z.string().min(1, { message: "Servidor é obrigatório" }),
  dia_vencimento: z.coerce.number().min(1, { message: "Dia de vencimento deve ser entre 1 e 31" }).max(31, { message: "Dia de vencimento deve ser entre 1 e 31" }),
  valor_plano: z.coerce.number().optional(),
  
  // Tela principal
  dispositivo_smart: z.string().max(25, { message: "Máximo de 25 caracteres" }).optional(),
  aplicativo: z.string().min(1, { message: "Aplicativo é obrigatório" }).max(25, { message: "Máximo de 25 caracteres" }),
  usuario_aplicativo: z.string().max(25, { message: "Máximo de 25 caracteres" }).optional(),
  senha_aplicativo: z.string().max(25, { message: "Máximo de 25 caracteres" }).optional(),
  data_licenca_aplicativo: z.string().optional(),
  
  // Tela adicional
  possui_tela_adicional: z.boolean().default(false),
  dispositivo_smart_2: z.string().max(25, { message: "Máximo de 25 caracteres" }).optional(),
  aplicativo_2: z.string().max(25, { message: "Máximo de 25 caracteres" }).optional(),
  usuario_2: z.string().max(25, { message: "Máximo de 25 caracteres" }).optional(),
  senha_2: z.string().max(25, { message: "Máximo de 25 caracteres" }).optional(),
  data_licenca_2: z.string().optional(),
  
  observacoes: z.string().max(300).optional(),
  status: z.string(),
});

export type ClienteFormValues = z.infer<typeof formSchema>;
