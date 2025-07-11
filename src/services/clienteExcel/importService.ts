
import * as XLSX from 'xlsx';
import { ClienteExcel, ImportResult } from './types';
import { convertDateBrToIso, convertToString } from './utils';
import { UnifiedClienteService } from '@/services/clienteService.unified';

// Função para importar clientes de um arquivo Excel
export async function importClientesFromExcel(file: File): Promise<ImportResult> {
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
        
        // Preparar dados para importação segura
        const clientesData = [];
        
        for (const row of jsonData) {
          // Converter dados do Excel para o formato do cliente
          const cliente = {
            nome: row['Nome'],
            telefone: row['Telefone'] ? convertToString(row['Telefone']) : null,
            codigo_pais_telefone: '+55', // Valor padrão para importações
            uf: row['UF'] || null,
            servidor: row['Servidor'],
            dia_vencimento: Number(row['Dia de Vencimento']),
            valor_plano: row['Plano'] ? 
              Number(String(row['Plano']).replace('R$', '').trim()) : null,
            dispositivo_smart: row['Dispositivo smart'] || null,
            aplicativo: row['Aplicativo'],
            usuario_aplicativo: row['Usuário'] ? convertToString(row['Usuário']) : '',
            senha_aplicativo: row['Senha'] ? convertToString(row['Senha']) : '',
            data_licenca_aplicativo: row['Vencimento da licença do app'] ? 
              convertDateBrToIso(row['Vencimento da licença do app']) : null,
            possui_tela_adicional: !!row['Aplicativo 2'],
            dispositivo_smart_2: row['Dispositivo smart 2'] || null,
            aplicativo_2: row['Aplicativo 2'] || null,
            usuario_2: row['Usuário 2'] ? convertToString(row['Usuário 2']) : null,
            senha_2: row['Senha 2'] ? convertToString(row['Senha 2']) : null,
            data_licenca_2: row['Vencimento da licença do app 2'] ? 
              convertDateBrToIso(row['Vencimento da licença do app 2']) : null,
            observacoes: row['Observações'] || null
          };
          
          clientesData.push(cliente);
        }
        
        // Usar importação segura via Edge Function
        const result = await UnifiedClienteService.secureImportClientes(clientesData);
        
        resolve({
          success: result.success,
          imported: result.imported || 0,
          errors: result.errors || []
        });
        
      } catch (error) {
        console.error('Erro ao importar clientes do Excel:', error);
        reject('Erro ao processar a importação. Verifique se o formato está correto.');
      }
    };
    
    reader.onerror = () => {
      reject('Erro ao ler o arquivo');
    };
    
    reader.readAsArrayBuffer(file);
  });
}
