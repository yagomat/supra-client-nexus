
import { Cliente } from '@/types';

// Define a interface para os dados do Excel
export interface ClienteExcel {
  'Data de cadastro': string | number;
  'Nome': string;
  'Telefone': string | number;
  'UF': string;
  'Servidor': string;
  'Dia de Vencimento': number;
  'Plano': string;
  'Dispositivo smart': string;
  'Aplicativo': string;
  'Usuário': string | number;
  'Senha': string | number;
  'Vencimento da licença do app': string | number;
  'Dispositivo smart 2': string;
  'Aplicativo 2': string;
  'Usuário 2': string | number;
  'Senha 2': string | number;
  'Vencimento da licença do app 2': string | number;
  'Observações': string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}
