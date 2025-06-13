
/**
 * Utilitários para processar múltiplos valores separados por ponto e vírgula
 */

export interface MultipleValueResult {
  isValid: boolean;
  values: (string | number)[];
  errors: string[];
  totalCount: number;
  validCount: number;
}

/**
 * Processa uma string com múltiplos valores separados por ponto e vírgula
 */
export const parseMultipleValues = (input: string): string[] => {
  if (!input || typeof input !== 'string') {
    return [];
  }
  
  return input
    .split(';')
    .map(value => value.trim())
    .filter(value => value.length > 0);
};

/**
 * Valida múltiplos valores para um tipo específico
 */
export const validateMultipleValues = (
  input: string | number, 
  activeTab: string
): MultipleValueResult => {
  const result: MultipleValueResult = {
    isValid: false,
    values: [],
    errors: [],
    totalCount: 0,
    validCount: 0
  };

  // Se é um número, processar como valor único
  if (typeof input === 'number') {
    result.totalCount = 1;
    
    if (activeTab === "dias_vencimento") {
      if (input >= 1 && input <= 31 && Number.isInteger(input)) {
        result.values = [input];
        result.validCount = 1;
        result.isValid = true;
      } else {
        result.errors.push("O dia de vencimento deve ser um número inteiro entre 1 e 31");
      }
    } else if (activeTab === "valores_plano") {
      if (input > 0 && input <= 1000) {
        result.values = [parseFloat(input.toFixed(2))];
        result.validCount = 1;
        result.isValid = true;
      } else {
        result.errors.push("O valor do plano deve ser maior que zero e no máximo R$ 1.000,00");
      }
    }
    
    return result;
  }

  // Processar como string (possivelmente múltiplos valores)
  const inputString = String(input);
  const rawValues = parseMultipleValues(inputString);
  
  if (rawValues.length === 0) {
    result.errors.push("Por favor, insira pelo menos um valor válido");
    return result;
  }

  if (rawValues.length > 10) {
    result.errors.push("Máximo de 10 valores permitidos por operação");
    return result;
  }

  result.totalCount = rawValues.length;
  const validValues: (string | number)[] = [];
  const errors: string[] = [];

  // Validar cada valor individualmente
  rawValues.forEach((value, index) => {
    const position = `Valor ${index + 1}`;
    
    if (activeTab === "dias_vencimento") {
      const numericValue = parseInt(value);
      if (isNaN(numericValue)) {
        errors.push(`${position}: deve ser um número válido`);
      } else if (numericValue < 1 || numericValue > 31) {
        errors.push(`${position}: deve ser entre 1 e 31`);
      } else {
        validValues.push(numericValue);
      }
    } else if (activeTab === "valores_plano") {
      const normalizedValue = value.replace(',', '.');
      const numericValue = parseFloat(normalizedValue);
      if (isNaN(numericValue)) {
        errors.push(`${position}: deve ser um número válido`);
      } else if (numericValue <= 0) {
        errors.push(`${position}: deve ser maior que zero`);
      } else if (numericValue > 1000) {
        errors.push(`${position}: deve ser no máximo R$ 1.000,00`);
      } else {
        validValues.push(parseFloat(numericValue.toFixed(2)));
      }
    } else if (activeTab === "ufs") {
      if (value.length > 2) {
        errors.push(`${position}: UF deve ter no máximo 2 caracteres`);
      } else {
        validValues.push(value.toUpperCase());
      }
    } else if (["servidores", "dispositivos_smart", "aplicativos"].includes(activeTab)) {
      if (value.length > 25) {
        errors.push(`${position}: deve ter no máximo 25 caracteres`);
      } else {
        validValues.push(value);
      }
    } else {
      validValues.push(value);
    }
  });

  // Remover duplicatas
  const uniqueValues = [...new Set(validValues)];
  
  result.values = uniqueValues;
  result.validCount = uniqueValues.length;
  result.errors = errors;
  result.isValid = uniqueValues.length > 0;

  // Se tivemos duplicatas, informar
  if (uniqueValues.length < validValues.length) {
    result.errors.push(`${validValues.length - uniqueValues.length} valor(es) duplicado(s) removido(s)`);
  }

  return result;
};

/**
 * Gera preview dos valores que serão adicionados
 */
export const generateValuePreview = (values: (string | number)[]): string => {
  if (values.length === 0) return "";
  
  if (values.length <= 3) {
    return values.join(", ");
  }
  
  return `${values.slice(0, 3).join(", ")} e mais ${values.length - 3}...`;
};
