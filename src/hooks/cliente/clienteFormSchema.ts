
import { z } from "zod";

// Schema sincronizado com validação do backend
export const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(40, "Nome deve ter no máximo 40 caracteres"),
  telefone: z.string().optional(),
  codigo_pais_telefone: z.string().default("+55"),
  uf: z.string().optional().refine((val) => {
    if (!val) return true;
    const upperVal = val.toUpperCase();
    return upperVal.length === 2 && /^[A-Z]{2}$/.test(upperVal);
  }, "UF deve ter 2 caracteres maiúsculos"),
  servidor: z.string().min(1, "Servidor é obrigatório").max(25, "Servidor deve ter no máximo 25 caracteres"),
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
  valor_plano: z.string().optional().refine((val) => {
    if (!val) return true;
    const numVal = parseFloat(val.replace(',', '.'));
    return !isNaN(numVal) && numVal > 0 && numVal <= 1000;
  }, "Valor deve ser entre 0,01 e 1000,00"),
  
  dispositivo_smart: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length <= 25;
  }, "Dispositivo deve ter no máximo 25 caracteres"),
  aplicativo: z.string().min(1, "Aplicativo é obrigatório").max(25, "Aplicativo deve ter no máximo 25 caracteres"),
  usuario_aplicativo: z.string().min(1, "Usuário do aplicativo é obrigatório"),
  senha_aplicativo: z.string().min(1, "Senha do aplicativo é obrigatória"),
  data_licenca_aplicativo: z.string().optional(),
  
  possui_tela_adicional: z.boolean().default(false),
  dispositivo_smart_2: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length <= 25;
  }, "Dispositivo deve ter no máximo 25 caracteres"),
  aplicativo_2: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length <= 25;
  }, "Aplicativo deve ter no máximo 25 caracteres"),
  usuario_2: z.string().optional(),
  senha_2: z.string().optional(),
  data_licenca_2: z.string().optional(),
  
  observacoes: z.string().optional(),
  status: z.enum(["ativo", "inativo"]).default("inativo"),
});

export type ClienteFormValues = z.infer<typeof formSchema>;
