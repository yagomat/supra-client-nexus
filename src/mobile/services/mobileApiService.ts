
import { supabase } from '@/integrations/supabase/client';

export interface MobileClienteInfo {
  id: string;
  nome: string;
  telefone: string;
  servidor: string;
  status: string;
  dia_vencimento: number;
  valor_plano?: number;
  observacoes?: string;
}

export interface MobileTemplate {
  tipo: string;
  mensagem: string;
}

class MobileApiService {
  async buscarClientePorTelefone(telefone: string): Promise<MobileClienteInfo | null> {
    try {
      console.log('Buscando cliente por telefone:', telefone);
      
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          id,
          nome,
          telefone,
          servidor,
          status,
          dia_vencimento,
          valor_plano,
          observacoes
        `)
        .eq('telefone', telefone)
        .single();

      if (error) {
        console.error('Erro ao buscar cliente:', error);
        return null;
      }

      return data as MobileClienteInfo;
    } catch (error) {
      console.error('Erro na busca do cliente:', error);
      return null;
    }
  }

  async buscarTemplates(): Promise<MobileTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('mensagens_whatsapp')
        .select('tipo_mensagem, mensagem');

      if (error) {
        console.error('Erro ao buscar templates:', error);
        return this.getDefaultTemplates();
      }

      // Map the data to match MobileTemplate interface
      const templates = data?.map(item => ({
        tipo: item.tipo_mensagem,
        mensagem: item.mensagem
      })) || [];

      return templates.length > 0 ? templates : this.getDefaultTemplates();
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      return this.getDefaultTemplates();
    }
  }

  private getDefaultTemplates(): MobileTemplate[] {
    return [
      {
        tipo: 'a_vencer',
        mensagem: 'Olá {{nome}}, sua mensalidade vence em breve no dia {{dia_vencimento}}. Valor: R$ {{valor_plano}}'
      },
      {
        tipo: 'vence_hoje',
        mensagem: 'Olá {{nome}}, sua mensalidade vence hoje. Valor: R$ {{valor_plano}}'
      },
      {
        tipo: 'vencido',
        mensagem: 'Olá {{nome}}, sua mensalidade está em atraso. Por favor, efetue o pagamento.'
      }
    ];
  }

  async registrarAcaoMobile(clienteId: string, acao: string, detalhes?: string) {
    try {
      // Use the existing cliente_cobrancas table to register mobile actions
      const { error } = await supabase
        .from('cliente_cobrancas')
        .insert({
          cliente_id: clienteId,
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          ultimo_aviso: acao,
          data_ultimo_aviso: new Date().toISOString(),
          mes_referencia: new Date().getMonth() + 1,
          ano_referencia: new Date().getFullYear()
        });

      if (error) {
        console.error('Erro ao registrar ação:', error);
      }
    } catch (error) {
      console.error('Erro ao registrar ação mobile:', error);
    }
  }
}

export const mobileApiService = new MobileApiService();
