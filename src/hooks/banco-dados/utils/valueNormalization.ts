import { secureLog } from '@/utils/secureLogger';

/**
 * Utilitários para normalização de valores
 */

export const normalizeValue = (value: string, tipo: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmedValue = value.trim();
  
  switch (tipo.toLowerCase()) {
    case 'servidor':
      return normalizeServerValue(trimmedValue);
    case 'aplicativo':
      return normalizeAppValue(trimmedValue);
    case 'uf':
      return normalizeUFValue(trimmedValue);
    case 'dispositivo_smart':
      return normalizeDeviceValue(trimmedValue);
    default:
      return trimmedValue;
  }
};

/**
 * Normaliza valores para formato do banco de dados
 */
export const normalizeValueForDatabase = (value: string | number, tipo: string): string => {
  const stringValue = String(value).trim();
  
  secureLog.info('Value normalization operation', {
    type: tipo,
    originalLength: stringValue.length,
    hasSpecialChars: /[^a-zA-Z0-9\s]/.test(stringValue)
  });
  
  switch (tipo.toLowerCase()) {
    case 'uf':
      return normalizeUFValue(stringValue);
    case 'servidor':
      return normalizeServerValue(stringValue);
    case 'aplicativo':
      return normalizeAppValue(stringValue);
    case 'dispositivo_smart':
      return normalizeDeviceValue(stringValue);
    case 'dia_vencimento':
      return String(parseInt(stringValue));
    case 'valor_plano':
      const numValue = parseFloat(stringValue.replace(',', '.'));
      return isNaN(numValue) ? '0' : numValue.toFixed(2);
    default:
      return stringValue;
  }
};

const normalizeServerValue = (value: string): string => {
  // Remover caracteres especiais e espaços extras
  let normalized = value
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Converter para lowercase para consistência
  normalized = normalized.toLowerCase();
  
  return normalized;
};

const normalizeAppValue = (value: string): string => {
  // Normalizar nomes de aplicativos comuns
  const appMap: Record<string, string> = {
    'pdv': 'PDV',
    'tef': 'TEF',
    'sat': 'SAT',
    'nfce': 'NFCe',
    'nfe': 'NFe',
    'mdfe': 'MDFe',
    'cte': 'CTe'
  };
  
  let normalized = value.trim();
  const lowerValue = normalized.toLowerCase();
  
  // Verificar se há uma normalização específica
  for (const [key, standardValue] of Object.entries(appMap)) {
    if (lowerValue.includes(key)) {
      normalized = normalized.replace(new RegExp(key, 'gi'), standardValue);
    }
  }
  
  return normalized;
};

const normalizeUFValue = (value: string): string => {
  // Normalizar UF para maiúsculas e validar
  const uf = value.toUpperCase().trim();
  
  const validUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  return validUFs.includes(uf) ? uf : value.trim();
};

const normalizeDeviceValue = (value: string): string => {
  // Normalizar nomes de dispositivos
  let normalized = value.trim();
  
  // Padrões comuns de dispositivos
  const devicePatterns: Record<string, string> = {
    'gertec': 'Gertec',
    'ingenico': 'Ingenico',
    'verifone': 'Verifone',
    'pax': 'PAX',
    'sunmi': 'Sunmi',
    'pos': 'POS'
  };
  
  const lowerValue = normalized.toLowerCase();
  
  for (const [pattern, standardName] of Object.entries(devicePatterns)) {
    if (lowerValue.includes(pattern)) {
      normalized = normalized.replace(new RegExp(pattern, 'gi'), standardName);
      break;
    }
  }
  
  return normalized;
};

export const validateNormalizedValue = (value: string, tipo: string): boolean => {
  if (!value || value.trim().length === 0) {
    return false;
  }
  
  switch (tipo.toLowerCase()) {
    case 'uf':
      return /^[A-Z]{2}$/.test(value);
    case 'servidor':
      return value.length >= 2 && value.length <= 100;
    case 'aplicativo':
      return value.length >= 2 && value.length <= 50;
    case 'dispositivo_smart':
      return value.length >= 2 && value.length <= 50;
    default:
      return true;
  }
};

export const getNormalizationStats = (originalValue: string, normalizedValue: string) => {
  return {
    wasModified: originalValue !== normalizedValue,
    originalLength: originalValue.length,
    normalizedLength: normalizedValue.length,
    compressionRatio: originalValue.length > 0 ? normalizedValue.length / originalValue.length : 0
  };
};
