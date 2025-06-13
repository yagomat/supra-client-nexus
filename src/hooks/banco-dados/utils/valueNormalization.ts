
/**
 * Utilitários para normalização de valores antes de operações no banco de dados
 */

export const normalizeValueForDatabase = (value: string | number, type: string): string => {
  if (type === 'valor_plano') {
    // Para valores de plano, converter para número e formatar com 2 casas decimais
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    if (isNaN(numericValue)) {
      throw new Error('Valor inválido para plano');
    }
    return numericValue.toFixed(2);
  }
  
  if (type === 'dia_vencimento') {
    // Para dias de vencimento, garantir que seja um número inteiro
    const numericValue = typeof value === 'number' ? value : parseInt(String(value));
    if (isNaN(numericValue)) {
      throw new Error('Valor inválido para dia de vencimento');
    }
    return String(numericValue);
  }
  
  if (type === 'uf') {
    // Para UFs, converter para maiúscula
    return String(value).toUpperCase().trim();
  }
  
  // Para outros tipos (servidor, dispositivo_smart, aplicativo), apenas trim
  return String(value).trim();
};

export const normalizeValueForDisplay = (value: string | number, type: string): string | number => {
  if (type === 'valores_plano') {
    // Para exibição de valores de plano, manter como número
    return typeof value === 'number' ? value : parseFloat(String(value));
  }
  
  if (type === 'dias_vencimento') {
    // Para exibição de dias de vencimento, manter como número
    return typeof value === 'number' ? value : parseInt(String(value));
  }
  
  // Para outros tipos, retornar como string
  return String(value);
};
