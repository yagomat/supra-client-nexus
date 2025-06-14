
/**
 * Utilitários para normalização de valores antes de operações no banco de dados
 */

export const normalizeValueForDatabase = (value: string | number, type: string): string => {
  console.log(`Normalizando valor "${value}" do tipo "${type}" para o banco de dados`);
  
  if (type === 'valor_plano') {
    // Para valores de plano, converter para número e formatar com 2 casas decimais
    const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    if (isNaN(numericValue)) {
      throw new Error('Valor inválido para plano');
    }
    const normalized = numericValue.toFixed(2);
    console.log(`Valor de plano normalizado: "${normalized}"`);
    return normalized;
  }
  
  if (type === 'dia_vencimento') {
    // Para dias de vencimento, garantir que seja um número inteiro
    const numericValue = typeof value === 'number' ? value : parseInt(String(value));
    if (isNaN(numericValue)) {
      throw new Error('Valor inválido para dia de vencimento');
    }
    const normalized = String(numericValue);
    console.log(`Dia de vencimento normalizado: "${normalized}"`);
    return normalized;
  }
  
  if (type === 'uf') {
    // Para UFs, converter para maiúscula e remover espaços
    const normalized = String(value).toUpperCase().trim();
    console.log(`UF normalizada: "${normalized}"`);
    return normalized;
  }
  
  // Para outros tipos (servidor, dispositivo_smart, aplicativo), apenas trim
  const normalized = String(value).trim();
  console.log(`Valor normalizado: "${normalized}"`);
  return normalized;
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
