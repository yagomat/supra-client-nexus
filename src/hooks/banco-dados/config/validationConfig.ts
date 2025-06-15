
/**
 * Configuração centralizada de validações para valores predefinidos
 * Esta configuração deve estar sincronizada com as validações do backend
 */

export interface ValidationRule {
  tipo: 'string' | 'integer' | 'decimal';
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
  maxItemsPerOperation: number;
  description: string;
  example: string;
  pattern?: RegExp;
}

export interface ValidationConfig {
  tipos: Record<string, ValidationRule>;
  ufsValidas: string[];
}

// Lista oficial de UFs brasileiras
export const UFS_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Configuração de validação centralizada
export const VALIDATION_CONFIG: ValidationConfig = {
  tipos: {
    ufs: {
      tipo: 'string',
      maxLength: 2,
      maxItemsPerOperation: 10,
      description: 'Estados brasileiros (sigla)',
      example: 'SP;RJ;MG',
      pattern: /^[A-Z]{2}$/
    },
    servidores: {
      tipo: 'string',
      maxLength: 25,
      maxItemsPerOperation: 10,
      description: 'Nomes de servidores',
      example: 'Servidor1;Servidor2',
      pattern: /^[a-zA-Z0-9\sçÇáàâãéèêíìîóòôõúùûüÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÜ._-]+$/
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
      example: 'TV Box;Smart TV',
      pattern: /^[a-zA-Z0-9\sçÇáàâãéèêíìîóòôõúùûüÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÜ._-]+$/
    },
    aplicativos: {
      tipo: 'string',
      maxLength: 25,
      maxItemsPerOperation: 10,
      description: 'Nomes de aplicativos',
      example: 'Netflix;YouTube',
      pattern: /^[a-zA-Z0-9\sçÇáàâãéèêíìîóòôõúùûüÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÜ._-]+$/
    }
  },
  ufsValidas: UFS_VALIDAS
};

// Códigos de erro padronizados
export const VALIDATION_ERROR_CODES = {
  EMPTY_VALUE: 'EMPTY_VALUE',
  INVALID_NUMBER: 'INVALID_NUMBER',
  INVALID_RANGE: 'INVALID_RANGE',
  INVALID_LENGTH: 'INVALID_LENGTH',
  INVALID_UF: 'INVALID_UF',
  INVALID_CHARACTERS: 'INVALID_CHARACTERS',
  INVALID_TYPE: 'INVALID_TYPE',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE'
} as const;

// Mensagens de erro padronizadas
export const VALIDATION_ERROR_MESSAGES = {
  [VALIDATION_ERROR_CODES.EMPTY_VALUE]: 'Valor não pode estar vazio',
  [VALIDATION_ERROR_CODES.INVALID_NUMBER]: 'Deve ser um número válido',
  [VALIDATION_ERROR_CODES.INVALID_RANGE]: 'Valor fora do intervalo permitido',
  [VALIDATION_ERROR_CODES.INVALID_LENGTH]: 'Tamanho inválido',
  [VALIDATION_ERROR_CODES.INVALID_UF]: 'UF informada não é válida',
  [VALIDATION_ERROR_CODES.INVALID_CHARACTERS]: 'Contém caracteres não permitidos',
  [VALIDATION_ERROR_CODES.INVALID_TYPE]: 'Tipo de valor não reconhecido',
  [VALIDATION_ERROR_CODES.DUPLICATE_VALUE]: 'Valor já existe'
} as const;
