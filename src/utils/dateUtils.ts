
export function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  
  // Verificar se é uma data válida
  if (isNaN(date.getTime())) {
    return "-";
  }
  
  // Formatar como DD/MM/YYYY
  return date.toLocaleDateString('pt-BR');
}
