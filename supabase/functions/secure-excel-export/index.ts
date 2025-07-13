
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClienteForExport {
  nome: string;
  telefone?: string;
  uf?: string;
  servidor: string;
  dia_vencimento: number;
  valor_plano?: number;
  dispositivo_smart?: string;
  aplicativo: string;
  usuario_aplicativo?: string;
  senha_aplicativo?: string;
  data_licenca_aplicativo?: string;
  dispositivo_smart_2?: string;
  aplicativo_2?: string;
  usuario_2?: string;
  senha_2?: string;
  observacoes?: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar rate limiting para exportação
    const { data: rateLimitOk, error: rateLimitError } = await supabaseClient.rpc('check_export_rate_limit', {
      p_user_id: user.id,
      p_max_requests: 10, // Máximo 10 exportações por hora
      p_time_window_minutes: 60
    });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Limite de exportações excedido (máximo 10 por hora). Tente novamente mais tarde.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar clientes do usuário com dados descriptografados
    const { data: clientes, error: clientesError } = await supabaseClient
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .order('nome');

    if (clientesError) {
      console.error('Erro ao buscar clientes:', clientesError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao buscar dados dos clientes' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Processar dados para exportação com mascaramento de senhas
    const exportData = clientes.map((cliente: any) => ({
      'Data de cadastro': new Date(cliente.created_at).toLocaleDateString('pt-BR'),
      'Nome': cliente.nome,
      'Telefone': cliente.telefone || '',
      'UF': cliente.uf || '',
      'Servidor': cliente.servidor,
      'Dia de Vencimento': cliente.dia_vencimento,
      'Plano': cliente.valor_plano ? `R$ ${Number(cliente.valor_plano).toFixed(2)}` : '',
      'Dispositivo smart': cliente.dispositivo_smart || '',
      'Aplicativo': cliente.aplicativo,
      'Usuário': cliente.usuario_aplicativo || '',
      'Senha': cliente.senha_aplicativo ? '***PROTEGIDO***' : '', // MASCARADO
      'Vencimento da licença do app': cliente.data_licenca_aplicativo ? 
        new Date(cliente.data_licenca_aplicativo).toLocaleDateString('pt-BR') : '',
      'Dispositivo smart 2': cliente.dispositivo_smart_2 || '',
      'Aplicativo 2': cliente.aplicativo_2 || '',
      'Usuário 2': cliente.usuario_2 || '',
      'Senha 2': cliente.senha_2 ? '***PROTEGIDO***' : '', // MASCARADO
      'Vencimento da licença do app 2': cliente.data_licenca_2 ? 
        new Date(cliente.data_licenca_2).toLocaleDateString('pt-BR') : '',
      'Observações': cliente.observacoes || ''
    }));

    // Registrar tentativa de exportação
    await supabaseClient.rpc('log_export_attempt', {
      p_user_id: user.id,
      p_count: clientes.length
    });

    // Log de auditoria
    await supabaseClient.rpc('log_audit_event', {
      p_user_id: user.id,
      p_event_type: 'excel_export_secure',
      p_details: {
        clientes_count: clientes.length,
        timestamp: new Date().toISOString(),
        masked_sensitive_data: true
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: exportData,
        count: clientes.length,
        message: 'Dados preparados para exportação (senhas protegidas)'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
