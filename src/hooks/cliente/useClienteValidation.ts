
import { useState } from "react";
import { validateClienteData } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export const useClienteValidation = () => {
  const [validating, setValidating] = useState(false);

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
      setValidating(true);
      const result = await validateClienteData(
        nome, 
        telefone, 
        uf, 
        servidor, 
        diaVencimento, 
        valorPlano, 
        aplicativo, 
        usuarioAplicativo, 
        senhaAplicativo
      );
      
      return result as unknown as ValidationResult;
    } catch (error) {
      console.error("Erro ao validar cliente:", error);
      return {
        valid: false,
        errors: ["Erro de conexão ao validar dados do cliente"]
      };
    } finally {
      setValidating(false);
    }
  };

  return {
    validating,
    validateCliente
  };
};
