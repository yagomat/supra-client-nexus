
import * as XLSX from 'xlsx';
import { formatDate } from '@/utils/dateUtils';

// Função para converter data do formato BR (DD/MM/YYYY) para ISO (YYYY-MM-DD)
export const convertDateBrToIso = (dateBr: string | number | null): string | null => {
  if (!dateBr) return null;
  
  // Se for um número (formato de data do Excel), converter usando XLSX
  if (typeof dateBr === 'number') {
    try {
      // Converter o número de dias do Excel para data JavaScript
      const excelDate = XLSX.SSF.parse_date_code(dateBr);
      const year = excelDate.y;
      const month = String(excelDate.m).padStart(2, '0');
      const day = String(excelDate.d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Erro ao converter número de data Excel:", dateBr, error);
      return null;
    }
  }
  
  // Se for string, processar como DD/MM/YYYY
  if (typeof dateBr === 'string') {
    const parts = dateBr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

// Função para converter valores numéricos em strings
export const convertToString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Configuração padrão de larguras de coluna para Excel
export const getDefaultColumnWidths = () => [
  { wch: 15 }, // Data de cadastro
  { wch: 30 }, // Nome
  { wch: 15 }, // Telefone
  { wch: 5 },  // UF
  { wch: 15 }, // Servidor
  { wch: 8 },  // Dia de Vencimento
  { wch: 10 }, // Plano
  { wch: 15 }, // Dispositivo smart
  { wch: 15 }, // Aplicativo
  { wch: 20 }, // Usuário
  { wch: 20 }, // Senha
  { wch: 15 }, // Vencimento da licença do app
  { wch: 15 }, // Dispositivo smart 2
  { wch: 15 }, // Aplicativo 2
  { wch: 20 }, // Usuário 2
  { wch: 20 }, // Senha 2
  { wch: 15 }, // Vencimento da licença do app 2
  { wch: 40 }  // Observações
];
