
// Configuração local de validação (migrada do arquivo removido)
const UFS_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const VALIDATION_ERROR_CODES = {
  INVALID_TYPE: 'INVALID_TYPE',
  EMPTY_VALUE: 'EMPTY_VALUE',
  INVALID_LENGTH: 'INVALID_LENGTH',
  INVALID_RANGE: 'INVALID_RANGE',
  INVALID_NUMBER: 'INVALID_NUMBER',
  INVALID_UF: 'INVALID_UF',
  INVALID_CHARACTERS: 'INVALID_CHARACTERS',
  SUCCESS: 'SUCCESS'
};

const VALIDATION_ERROR_MESSAGES = {
  INVALID_TYPE: 'Tipo de valor não reconhecido',
  EMPTY_VALUE: 'Valor não pode estar vazio',
  INVALID_LENGTH: 'Comprimento inválido',
  INVALID_RANGE: 'Valor fora do intervalo permitido',
  INVALID_NUMBER: 'Número inválido',
  INVALID_UF: 'UF inválida',
  INVALID_CHARACTERS: 'Caracteres inválidos',
  SUCCESS: 'Sucesso'
};

const VALIDATION_CONFIG = {
  tipos: {
    ufs: {
      tipo: 'string',
      maxLength: 2,
      maxItemsPerOperation: 10,
      description: 'Estados brasileiros (sigla)',
      example: 'SP;RJ;MG'
    },
    servidores: {
      tipo: 'string',
      maxLength: 25,
      maxItemsPerOperation: 10,
      description: 'Nomes de servidores',
      example: 'Servidor1;Servidor2'
    },
    dias_vencimento: {
      tipo: 'integer',
      minValue: 1,
      maxValue: 31,
      maxItemsPerOperation: 10,
      description: 'Dias de vencimento (1-31)',
      example: '10;15;20'
    },
    valores_plano: {
      tipo: 'decimal',
      minValue: 0.01,
      maxValue: 1000,
      decimalPlaces: 2,
      maxItemsPerOperation: 10,
      description: 'Valores de plano (até R$ 1.000)',
      example: '49.90;99.90;199.90'
    },
    dispositivos_smart: {
      tipo: 'string',
      maxLength: 25,
      maxItemsPerOperation: 10,
      description: 'Nomes de dispositivos',
      example: 'TV Box;Smart TV'
    },
    aplicativos: {
      tipo: 'string',
      maxLength: 25,
      maxItemsPerOperation: 10,
      description: 'Nomes de aplicativos',
      example: 'Netflix;YouTube'
    }
  }
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedValue?: string | number;
  code?: string;
}

// Mapeamento dos tipos singulares para plurais para acessar a configuração
const SINGULAR_TO_PLURAL_TYPE_MAP: Record<string, string> = {
  'uf': 'ufs',
  'servidor': 'servidores', 
  'dia_vencimento': 'dias_vencimento',
  'valor_plano': 'valores_plano',
  'dispositivo_smart': 'dispositivos_smart',
  'aplicativo': 'aplicativos'
};

/**
 * Valida um valor individual usando as mesmas regras do backend
 */
export const validateSingleValue = (value: string | number, type: string): ValidationResult => {
  const stringValue = String(value).trim();
  
  // Mapear tipo singular para plural para acessar configuração
  const configType = SINGULAR_TO_PLURAL_TYPE_MAP[type] || type;
  const config = VALIDATION_CONFIG.tipos[configType];
  
  if (!config) {
    return {
      isValid: false,
      errors: [VALIDATION_ERROR_MESSAGES.INVALID_TYPE],
      code: VALIDATION_ERROR_CODES.INVALID_TYPE
    };
  }

  // Validação de valor vazio
  if (!stringValue) {
    return {
      isValid: false,
      errors: [VALIDATION_ERROR_MESSAGES.EMPTY_VALUE],
      code: VALIDATION_ERROR_CODES.EMPTY_VALUE
    };
  }

  // Validações específicas por tipo
  switch (configType) {
    case 'dias_vencimento':
      return validateDiaVencimento(stringValue);
    
    case 'valores_plano':
      return validateValorPlano(stringValue);
    
    case 'ufs':
      return validateUF(stringValue);
    
    case 'servidores':
    case 'dispositivos_smart':
    case 'aplicativos':
      return validateStringField(stringValue, config);
    
    default:
      return {
        isValid: false,
        errors: [VALIDATION_ERROR_MESSAGES.INVALID_TYPE],
        code: VALIDATION_ERROR_CODES.INVALID_TYPE
      };
  }
};

const validateDiaVencimento = (value: string): ValidationResult => {
  const numericValue = parseInt(value);
  
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      errors: ['Dia de vencimento deve ser um número inteiro válido'],
      code: VALIDATION_ERROR_CODES.INVALID_NUMBER
    };
  }
  
  if (numericValue < 1 || numericValue > 31) {
    return {
      isValid: false,
      errors: ['Dia de vencimento deve ser entre 1 e 31'],
      code: VALIDATION_ERROR_CODES.INVALID_RANGE
    };
  }
  
  return {
    isValid: true,
    errors: [],
    normalizedValue: numericValue
  };
};

const validateValorPlano = (value: string): ValidationResult => {
  // Permitir vírgula como separador decimal
  const normalizedValue = value.replace(',', '.');
  const numericValue = parseFloat(normalizedValue);
  
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      errors: ['Valor do plano deve ser um número válido'],
      code: VALIDATION_ERROR_CODES.INVALID_NUMBER
    };
  }
  
  if (numericValue <= 0) {
    return {
      isValid: false,
      errors: ['Valor do plano deve ser maior que zero'],
      code: VALIDATION_ERROR_CODES.INVALID_RANGE
    };
  }
  
  if (numericValue > 1000) {
    return {
      isValid: false,
      errors: ['Valor do plano deve ser no máximo R$ 1.000,00'],
      code: VALIDATION_ERROR_CODES.INVALID_RANGE
    };
  }
  
  return {
    isValid: true,
    errors: [],
    normalizedValue: Math.round(numericValue * 100) / 100 // 2 casas decimais
  };
};

const validateUF = (value: string): ValidationResult => {
  const upperValue = value.toUpperCase();
  
  if (value.length > 2) {
    return {
      isValid: false,
      errors: ['UF deve ter no máximo 2 caracteres'],
      code: VALIDATION_ERROR_CODES.INVALID_LENGTH
    };
  }
  
  if (!UFS_VALIDAS.includes(upperValue)) {
    return {
      isValid: false,
      errors: ['UF informada não é válida'],
      code: VALIDATION_ERROR_CODES.INVALID_UF
    };
  }
  
  return {
    isValid: true,
    errors: [],
    normalizedValue: upperValue
  };
};

const validateStringField = (value: string, config: any): ValidationResult => {
  if (value.length > config.maxLength) {
    return {
      isValid: false,
      errors: [`Valor deve ter no máximo ${config.maxLength} caracteres`],
      code: VALIDATION_ERROR_CODES.INVALID_LENGTH
    };
  }
  
  if (config.pattern && !config.pattern.test(value)) {
    return {
      isValid: false,
      errors: ['Valor contém caracteres não permitidos'],
      code: VALIDATION_ERROR_CODES.INVALID_CHARACTERS
    };
  }
  
  return {
    isValid: true,
    errors: [],
    normalizedValue: value.trim()
  };
};

/**
 * Valida múltiplos valores separados por ponto e vírgula
 */
export const validateMultipleValuesEnhanced = (input: string | number, type: string): {
  isValid: boolean;
  errors: string[];
  values: (string | number)[];
  validCount: number;
  totalCount: number;
} => {
  const inputString = String(input);
  
  // Mapear tipo singular para plural para acessar configuração
  const configType = SINGULAR_TO_PLURAL_TYPE_MAP[type] || type;
  const config = VALIDATION_CONFIG.tipos[configType];
  
  if (!config) {
    return {
      isValid: false,
      errors: [VALIDATION_ERROR_MESSAGES.INVALID_TYPE],
      values: [],
      validCount: 0,
      totalCount: 0
    };
  }

  // Se não contém ponto e vírgula, trata como valor único
  if (!inputString.includes(';')) {
    const validation = validateSingleValue(input, type);
    return {
      isValid: validation.isValid,
      errors: validation.errors,
      values: validation.isValid ? [validation.normalizedValue!] : [],
      validCount: validation.isValid ? 1 : 0,
      totalCount: 1
    };
  }

  // Processar múltiplos valores
  const rawValues = inputString.split(';').map(v => v.trim()).filter(v => v);
  const errors: string[] = [];
  const validValues: (string | number)[] = [];
  
  // Verificar limite de itens por operação
  if (rawValues.length > config.maxItemsPerOperation) {
    errors.push(`Máximo de ${config.maxItemsPerOperation} valores por operação`);
    return {
      isValid: false,
      errors,
      values: [],
      validCount: 0,
      totalCount: rawValues.length
    };
  }

  // Validar cada valor individualmente
  rawValues.forEach((rawValue, index) => {
    const validation = validateSingleValue(rawValue, type);
    if (validation.isValid) {
      validValues.push(validation.normalizedValue!);
    } else {
      errors.push(`Item ${index + 1}: ${validation.errors[0]}`);
    }
  });

  return {
    isValid: validValues.length > 0 && errors.length === 0,
    errors,
    values: validValues,
    validCount: validValues.length,
    totalCount: rawValues.length
  };
};
