
import { ValoresPredefinidos } from "@/types";

/**
 * Converte um tipo plural para o tipo singular usado no banco de dados
 */
export function convertToSingularType(tipo: keyof ValoresPredefinidos): string {
  switch (tipo) {
    case 'ufs':
      return 'uf';
    case 'servidores':
      return 'servidor';
    case 'dias_vencimento':
      return 'dia_vencimento';
    case 'valores_plano':
      return 'valor_plano';
    case 'dispositivos_smart':
      return 'dispositivo_smart';
    case 'aplicativos':
      return 'aplicativo';
    default:
      throw new Error(`Tipo inválido: ${tipo}`);
  }
}

/**
 * Organiza todos os arrays em ValoresPredefinidos
 */
export function sortValoresPredefinidos(valoresPredefinidos: ValoresPredefinidos): void {
  // Ordenar arrays numéricos
  valoresPredefinidos.dias_vencimento.sort((a, b) => a - b);
  valoresPredefinidos.valores_plano.sort((a, b) => a - b);
  
  // Ordenar arrays de strings em ordem alfabética
  valoresPredefinidos.ufs.sort();
  valoresPredefinidos.servidores.sort();
  valoresPredefinidos.dispositivos_smart.sort();
  valoresPredefinidos.aplicativos.sort();
}

/**
 * Processa dados brutos do banco de dados para a estrutura ValoresPredefinidos
 */
export function processValoresPredefinidos(
  data: { tipo: string; valor: string }[], 
  valoresPredefinidos: ValoresPredefinidos
): ValoresPredefinidos {
  // Popular os diferentes tipos de valores predefinidos
  data.forEach((item) => {
    const { tipo, valor } = item;
    
    switch (tipo) {
      case 'uf':
        valoresPredefinidos.ufs.push(valor);
        break;
      case 'servidor':
        valoresPredefinidos.servidores.push(valor);
        break;
      case 'dia_vencimento':
        // Garantir que os dias de vencimento sejam números inteiros válidos
        const diaVencimento = parseInt(valor);
        if (!isNaN(diaVencimento) && diaVencimento >= 1 && diaVencimento <= 31) {
          valoresPredefinidos.dias_vencimento.push(diaVencimento);
        }
        break;
      case 'valor_plano':
        // Garantir que os valores de plano sejam números de ponto flutuante válidos
        const valorPlano = parseFloat(valor);
        if (!isNaN(valorPlano) && valorPlano > 0) {
          valoresPredefinidos.valores_plano.push(valorPlano);
        }
        break;
      case 'dispositivo_smart':
        valoresPredefinidos.dispositivos_smart.push(valor);
        break;
      case 'aplicativo':
        valoresPredefinidos.aplicativos.push(valor);
        break;
      default:
        break;
    }
  });
  
  // Ordenar arrays
  sortValoresPredefinidos(valoresPredefinidos);
  
  return valoresPredefinidos;
}
