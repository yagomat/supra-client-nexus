
import { z } from "zod";

export const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(40, "Nome deve ter no máximo 40 caracteres"),
  telefone: z.string().optional(),
  codigo_pais_telefone: z.string().default("+55"),
  uf: z.string().optional(),
  servidor: z.string().min(1, "Servidor é obrigatório"),
  dia_vencimento: z.union([
    z.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31"),
    z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 31) {
        throw new Error("Dia deve ser entre 1 e 31");
      }
      return num;
    })
  ]),
  valor_plano: z.string().optional(),
  
  dispositivo_smart: z.string().optional(),
  aplicativo: z.string().min(1, "Aplicativo é obrigatório"),
  usuario_aplicativo: z.string().min(1, "Usuário do aplicativo é obrigatório"),
  senha_aplicativo: z.string().min(1, "Senha do aplicativo é obrigatória"),
  data_licenca_aplicativo: z.string().optional(),
  
  possui_tela_adicional: z.boolean().default(false),
  dispositivo_smart_2: z.string().optional(),
  aplicativo_2: z.string().optional(),
  usuario_2: z.string().optional(),
  senha_2: z.string().optional(),
  data_licenca_2: z.string().optional(),
  
  observacoes: z.string().optional(),
  status: z.enum(["ativo", "inativo"]).default("inativo"),
});

export type ClienteFormValues = z.infer<typeof formSchema>;
