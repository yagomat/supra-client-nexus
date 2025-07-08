
import { useValidationCentralized } from "@/hooks/useValidationCentralized";

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export const useClienteValidation = () => {
  const { validating, validateCliente: validateClienteCentralized } = useValidationCentralized();

  const validateCliente = async (
    nome: string, 
    telefone: string | null, 
    uf: string | null, 
    servidor: string,
    diaVencimento: number,
    valorPlano: number | null,
    aplicativo: string,
    usuarioAplicativo: string,
    senhaAplicativo: string
  ): Promise<ValidationResult> => {
    try {
      const result = await validateClienteCentralized(
        nome,
        servidor,
        diaVencimento,
        aplicativo,
        usuarioAplicativo,
        senhaAplicativo,
        telefone || undefined,
        uf || undefined,
        valorPlano || undefined
      );
      
      return {
        valid: result.valid,
        errors: result.errors
      };
    } catch (error) {
      console.error("Erro ao validar cliente:", error);
      return {
        valid: false,
        errors: ["Erro de conexão ao validar dados do cliente"]
      };
    }
  };

  return {
    validating,
    validateCliente
  };
};
