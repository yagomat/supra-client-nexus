
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export interface SecureExportResult {
  success: boolean;
  error?: string;
  count?: number;
}

// Função para exportar clientes usando a Edge Function segura
export async function secureExportClientesToExcel(): Promise<SecureExportResult> {
  try {
    console.log('Iniciando exportação segura...');
    
    // Chamar Edge Function para processar dados
    const { data, error } = await supabase.functions.invoke('secure-excel-export');

    if (error) {
      console.error('Erro na Edge Function:', error);
      throw new Error(error.message || 'Erro ao processar exportação');
    }

    if (!data.success) {
      throw new Error(data.error || 'Falha na exportação');
    }

    console.log('Dados processados pela Edge Function:', data.count, 'clientes');

    // Criar planilha Excel com os dados processados (já com senhas mascaradas)
    const worksheet = XLSX.utils.json_to_sheet(data.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

    // Configurar larguras de coluna
    const columnWidths = [
      { wch: 12 }, // Data de cadastro
      { wch: 25 }, // Nome
      { wch: 15 }, // Telefone
      { wch: 5 },  // UF
      { wch: 20 }, // Servidor
      { wch: 12 }, // Dia de Vencimento
      { wch: 12 }, // Plano
      { wch: 20 }, // Dispositivo smart
      { wch: 15 }, // Aplicativo
      { wch: 20 }, // Usuário
      { wch: 15 }, // Senha (mascarada)
      { wch: 12 }, // Vencimento licença
      { wch: 20 }, // Dispositivo smart 2
      { wch: 15 }, // Aplicativo 2
      { wch: 20 }, // Usuário 2
      { wch: 15 }, // Senha 2 (mascarada)
      { wch: 12 }, // Vencimento licença 2
      { wch: 30 }  // Observações
    ];
    
    worksheet['!cols'] = columnWidths;

    // Gerar e salvar o arquivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    // Nome do arquivo com data atual
    const fileName = `clientes_seguros_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
    
    console.log('Exportação segura concluída:', fileName);
    
    return {
      success: true,
      count: data.count
    };

  } catch (error) {
    console.error('Erro na exportação segura:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na exportação'
    };
  }
}
