
import { useToast } from "@/components/ui/use-toast";

/**
 * Funções de validação para os valores predefinidos
 */

export const validateNumericValue = (value: unknown, activeTab: string): { isValid: boolean; value?: number } => {
  const { toast } = useToast();
  
  // Validação para valores numéricos
  if (typeof value !== 'number') {
    toast({
      title: "Valor inválido",
      description: "Por favor, informe um valor numérico válido.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Validação específica para dia_vencimento
  if (activeTab === "dias_vencimento") {
    if (value < 1 || value > 31 || !Number.isInteger(value)) {
      toast({
        title: "Valor inválido",
        description: "O dia de vencimento deve ser um número inteiro entre 1 e 31.",
        variant: "destructive",
      });
      return { isValid: false };
    }
  }
  
  return { isValid: true, value };
};

export const validatePlanoValue = (value: unknown): { isValid: boolean; value?: number } => {
  const { toast } = useToast();
  
  let valorPlano: number;
  
  if (typeof value === 'string') {
    // Converter string para número de forma segura, aceitando formatos como "25,99"
    const normalizedValue = value.replace(',', '.');
    valorPlano = parseFloat(normalizedValue);
    
    if (isNaN(valorPlano)) {
      toast({
        title: "Valor inválido",
        description: "O valor do plano deve ser um número válido.",
        variant: "destructive",
      });
      return { isValid: false };
    }
  } else if (typeof value === 'number') {
    valorPlano = value;
  } else {
    toast({
      title: "Valor inválido",
      description: "O valor do plano deve ser um número válido.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Validar o valor do plano
  if (valorPlano <= 0) {
    toast({
      title: "Valor inválido",
      description: "O valor do plano deve ser maior que zero.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Arredondar para duas casas decimais
  valorPlano = parseFloat(valorPlano.toFixed(2));
  
  return { isValid: true, value: valorPlano };
};

export const validateTextValue = (value: unknown, activeTab: string): { isValid: boolean; value?: string } => {
  const { toast } = useToast();
  
  // Para valores de texto
  if (typeof value !== 'string') {
    toast({
      title: "Valor inválido",
      description: "Por favor, informe um valor de texto válido.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Validations for text values
  if (activeTab === "ufs" && value.length > 2) {
    toast({
      title: "UF inválida",
      description: "A UF deve ter no máximo 2 caracteres.",
      variant: "destructive",
    });
    return { isValid: false };
  } else if (["servidores", "dispositivos_smart", "aplicativos"].includes(activeTab) && value.length > 25) {
    toast({
      title: "Valor inválido",
      description: "O valor deve ter no máximo 25 caracteres.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  return { isValid: true, value };
};
