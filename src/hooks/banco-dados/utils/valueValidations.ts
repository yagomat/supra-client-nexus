
import { useToast } from "@/hooks/use-toast";

/**
 * Funções de validação para os valores predefinidos
 */

export const validateNumericValue = (value: unknown, activeTab: string): { isValid: boolean; value?: number } => {
  const { toast } = useToast();
  
  console.log(`Validando valor numérico: ${value} para aba: ${activeTab}`);
  
  // Validação para valores numéricos
  if (typeof value !== 'number') {
    console.error(`Valor não é numérico: ${typeof value}`);
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
      console.error(`Dia de vencimento inválido: ${value}`);
      toast({
        title: "Valor inválido",
        description: "O dia de vencimento deve ser um número inteiro entre 1 e 31.",
        variant: "destructive",
      });
      return { isValid: false };
    }
  }
  
  console.log(`Valor numérico válido: ${value}`);
  return { isValid: true, value };
};

export const validatePlanoValue = (value: unknown): { isValid: boolean; value?: number } => {
  const { toast } = useToast();
  
  console.log(`Validando valor de plano: ${value} (tipo: ${typeof value})`);
  
  let valorPlano: number;
  
  if (typeof value === 'string') {
    // Converter string para número de forma segura, aceitando formatos como "25,99"
    const normalizedValue = value.replace(',', '.');
    valorPlano = parseFloat(normalizedValue);
    
    if (isNaN(valorPlano)) {
      console.error(`Não foi possível converter string para número: "${value}"`);
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
    console.error(`Tipo de valor inválido para plano: ${typeof value}`);
    toast({
      title: "Valor inválido",
      description: "O valor do plano deve ser um número válido.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Validar o valor do plano
  if (valorPlano <= 0) {
    console.error(`Valor de plano deve ser positivo: ${valorPlano}`);
    toast({
      title: "Valor inválido",
      description: "O valor do plano deve ser maior que zero.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Validar limite máximo de R$ 1.000,00
  if (valorPlano > 1000) {
    console.error(`Valor de plano excede limite: ${valorPlano}`);
    toast({
      title: "Valor inválido",
      description: "O valor do plano deve ser no máximo R$ 1.000,00.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Arredondar para duas casas decimais
  valorPlano = parseFloat(valorPlano.toFixed(2));
  
  console.log(`Valor de plano válido: ${valorPlano}`);
  return { isValid: true, value: valorPlano };
};

export const validateTextValue = (value: unknown, activeTab: string): { isValid: boolean; value?: string } => {
  const { toast } = useToast();
  
  console.log(`Validando valor de texto: "${value}" para aba: ${activeTab}`);
  
  // Para valores de texto
  if (typeof value !== 'string') {
    console.error(`Valor não é string: ${typeof value}`);
    toast({
      title: "Valor inválido",
      description: "Por favor, informe um valor de texto válido.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  // Validations for text values
  if (activeTab === "ufs" && value.length > 2) {
    console.error(`UF muito longa: "${value}" (${value.length} caracteres)`);
    toast({
      title: "UF inválida",
      description: "A UF deve ter no máximo 2 caracteres.",
      variant: "destructive",
    });
    return { isValid: false };
  } else if (["servidores", "dispositivos_smart", "aplicativos"].includes(activeTab) && value.length > 25) {
    console.error(`Valor muito longo para ${activeTab}: "${value}" (${value.length} caracteres)`);
    toast({
      title: "Valor inválido",
      description: "O valor deve ter no máximo 25 caracteres.",
      variant: "destructive",
    });
    return { isValid: false };
  }
  
  console.log(`Valor de texto válido: "${value}"`);
  return { isValid: true, value };
};
