
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Cliente } from '@/types';
import { ClienteExcel } from './types';
import { formatDate } from '@/utils/dateUtils';
import { getDefaultColumnWidths } from './utils';

// Função para exportar clientes para Excel
export async function exportClientesToExcel(clientes: Cliente[]): Promise<void> {
  try {
    // Converter os clientes para o formato Excel
    const excelData: ClienteExcel[] = clientes.map(cliente => ({
      'Data de cadastro': formatDate(cliente.created_at),
      'Nome': cliente.nome,
      'Telefone': cliente.telefone || '',
      'UF': cliente.uf || '',
      'Servidor': cliente.servidor,
      'Dia de Vencimento': cliente.dia_vencimento,
      'Plano': cliente.valor_plano ? `R$ ${Number(cliente.valor_plano).toFixed(2)}` : '',
      'Dispositivo smart': cliente.dispositivo_smart || '',
      'Aplicativo': cliente.aplicativo,
      'Usuário': cliente.usuario_aplicativo,
      'Senha': cliente.senha_aplicativo,
      'Vencimento da licença do app': cliente.data_licenca_aplicativo ? formatDate(cliente.data_licenca_aplicativo) : '',
      'Dispositivo smart 2': cliente.dispositivo_smart_2 || '',
      'Aplicativo 2': cliente.aplicativo_2 || '',
      'Usuário 2': cliente.usuario_2 || '',
      'Senha 2': cliente.senha_2 || '',
      'Vencimento da licença do app 2': cliente.data_licenca_2 ? formatDate(cliente.data_licenca_2) : '',
      'Observações': cliente.observacoes || ''
    }));

    // Criar uma planilha Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

    // Configurar larguras de coluna adequadas
    worksheet['!cols'] = getDefaultColumnWidths();

    // Gerar e salvar o arquivo Excel (.xlsx)
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    // Nome do arquivo com data atual
    const fileName = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao exportar clientes para Excel:', error);
    return Promise.reject('Erro ao exportar clientes para Excel');
  }
}
