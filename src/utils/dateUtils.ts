
import { formatDateInSystemTimezone } from './timezone';

export function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  
  try {
    // Usar a função de timezone padronizada
    return formatDateInSystemTimezone(dateString, 'dd/MM/yyyy');
  } catch (error) {
    console.error("Erro ao formatar data:", dateString, error);
    return "-";
  }
}

/**
 * Formata data e hora
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-";
  
  try {
    return formatDateInSystemTimezone(dateString, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error("Erro ao formatar data e hora:", dateString, error);
    return "-";
  }
}
