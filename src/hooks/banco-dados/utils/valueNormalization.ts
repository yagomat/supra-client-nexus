
import { VALIDATION_CONFIG } from "../config/validationConfig";

/**
 * Utilitários para normalização de valores antes de operações no banco de dados
 * Atualizado para usar a configuração centralizada
 */

// Mapeamento dos tipos singulares para plurais para acessar a configuração
const SINGULAR_TO_PLURAL_TYPE_MAP: Record<string, string> = {
  'uf': 'ufs',
  'servidor': 'servidores', 
  'dia_vencimento': 'dias_vencimento',
  'valor_plano': 'valores_plano',
  'dispositivo_smart': 'dispositivos_smart',
  'aplicativo': 'aplicativos'
};

export const normalizeValueForDatabase = (value: string | number, type: string): string => {
  console.log(`Normalizando valor "${value}" do tipo "${type}" para o banco de dados`);
  
  // Mapear tipo singular para plural para acessar configuração
  const configType = SINGULAR_TO_PLURAL_TYPE_MAP[type] || type;
  const config = VALIDATION_CONFIG.tipos[configType];
  
  if (!config) {
    throw new Error(`Tipo "${type}" não reconhecido`);
  }

  switch (config.tipo) {
    case 'decimal':
      // Para valores decimais (valores de plano)
      const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
      if (isNaN(numericValue)) {
        throw new Error('Valor inválido para tipo decimal');
      }
      const normalized = numericValue.toFixed(config.decimalPlaces || 2);
      console.log(`Valor decimal normalizado: "${normalized}"`);
      return normalized;
    
    case 'integer':
      // Para valores inteiros (dias de vencimento)
      const intValue = typeof value === 'number' ? value : parseInt(String(value));
      if (isNaN(intValue)) {
        throw new Error('Valor inválido para tipo inteiro');
      }
      const normalizedInt = String(intValue);
      console.log(`Valor inteiro normalizado: "${normalizedInt}"`);
      return normalizedInt;
    
    case 'string':
      // Para valores de string
      let stringValue = String(value).trim();
      
      // Casos especiais
      if (type === 'uf') {
        stringValue = stringValue.toUpperCase();
        console.log(`UF normalizada: "${stringValue}"`);
      } else {
        console.log(`String normalizada: "${stringValue}"`);
      }
      
      return stringValue;
    
    default:
      const defaultNormalized = String(value).trim();
      console.log(`Valor normalizado (padrão): "${defaultNormalized}"`);
      return defaultNormalized;
  }
};

export const normalizeValueForDisplay = (value: string | number, type: string): string | number => {
  // Mapear tipo singular para plural para acessar configuração
  const configType = SINGULAR_TO_PLURAL_TYPE_MAP[type] || type;
  const config = VALIDATION_CONFIG.tipos[configType];
  
  if (!config) {
    return String(value);
  }

  switch (config.tipo) {
    case 'decimal':
    case 'integer':
      // Para tipos numéricos, retornar como número
      return typeof value === 'number' ? value : parseFloat(String(value));
    
    default:
      // Para outros tipos, retornar como string
      return String(value);
  }
};

/**
 * Formata um valor para exibição amigável ao usuário
 */
export const formatValueForDisplay = (value: string | number, type: string): string => {
  // Mapear tipo singular para plural para acessar configuração
  const configType = SINGULAR_TO_PLURAL_TYPE_MAP[type] || type;
  const config = VALIDATION_CONFIG.tipos[configType];
  
  if (!config) {
    return String(value);
  }

  switch (configType) {
    case 'valores_plano':
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
    
    case 'dias_vencimento':
      return `Dia ${value}`;
    
    case 'ufs':
      return String(value).toUpperCase();
    
    default:
      return String(value);
  }
};
