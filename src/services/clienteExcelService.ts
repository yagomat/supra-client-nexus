
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Cliente } from '@/types';
import { createCliente } from './clienteService';
import { formatDate } from '@/utils/dateUtils';

// Define a interface para os dados do Excel
interface ClienteExcel {
  'Data de cadastro': string;
  'Nome': string;
  'Telefone': string;
  'UF': string;
  'Servidor': string;
  'Dia de Vencimento': number;
  'Plano': string;
  'Dispositivo smart': string;
  'Aplicativo': string;
  'Usuário': string;
  'Senha': string;
  'Vencimento da licença do app': string;
  'Dispositivo smart 2': string;
  'Aplicativo 2': string;
  'Usuário 2': string;
  'Senha 2': string;
  'Vencimento da licença do app 2': string;
  'Observações': string;
}

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
    const colWidths = [
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
    worksheet['!cols'] = colWidths;

    // Gerar e salvar o arquivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Nome do arquivo com data atual
    const fileName = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao exportar clientes para Excel:', error);
    return Promise.reject('Erro ao exportar clientes para Excel');
  }
}

// Função para importar clientes de um arquivo Excel
export async function importClientesFromExcel(file: File): Promise<{ success: boolean, imported: number, errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const errors: string[] = [];
    let imported = 0;
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pegar a primeira planilha
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json<ClienteExcel>(worksheet);
        
        // Processar cada linha e criar clientes
        for (const row of jsonData) {
          try {
            // Converter dados do Excel para o formato do cliente
            const cliente = {
              nome: row['Nome'],
              telefone: row['Telefone'],
              uf: row['UF'],
              servidor: row['Servidor'],
              dia_vencimento: Number(row['Dia de Vencimento']),
              valor_plano: row['Plano'] ? Number(row['Plano'].replace('R$', '').trim()) : null,
              dispositivo_smart: row['Dispositivo smart'],
              aplicativo: row['Aplicativo'],
              usuario_aplicativo: row['Usuário'],
              senha_aplicativo: row['Senha'],
              data_licenca_aplicativo: row['Vencimento da licença do app'] ? row['Vencimento da licença do app'] : null,
              possui_tela_adicional: !!row['Aplicativo 2'],
              dispositivo_smart_2: row['Dispositivo smart 2'],
              aplicativo_2: row['Aplicativo 2'],
              usuario_2: row['Usuário 2'],
              senha_2: row['Senha 2'],
              data_licenca_2: row['Vencimento da licença do app 2'] ? row['Vencimento da licença do app 2'] : null,
              observacoes: row['Observações'],
              status: 'ativo' // Status padrão para novos clientes
            };
            
            // Validar dados mínimos obrigatórios
            if (!cliente.nome || !cliente.servidor || !cliente.aplicativo || 
                !cliente.usuario_aplicativo || !cliente.senha_aplicativo || 
                isNaN(cliente.dia_vencimento)) {
              errors.push(`Cliente com nome "${cliente.nome || 'sem nome'}" possui campos obrigatórios faltando`);
              continue;
            }
            
            // Criar o cliente no banco de dados
            await createCliente(cliente);
            imported++;
          } catch (err) {
            console.error('Erro ao processar linha:', row, err);
            errors.push(`Erro ao importar cliente "${row['Nome'] || 'desconhecido'}"`);
          }
        }
        
        resolve({
          success: imported > 0,
          imported,
          errors
        });
      } catch (error) {
        console.error('Erro ao importar clientes do Excel:', error);
        reject('Erro ao ler o arquivo Excel. Verifique se o formato está correto.');
      }
    };
    
    reader.onerror = () => {
      reject('Erro ao ler o arquivo');
    };
    
    reader.readAsArrayBuffer(file);
  });
}
