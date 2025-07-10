import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClienteData {
  nome: string;
  telefone?: string;
  codigo_pais_telefone?: string;
  uf?: string;
  servidor: string;
  dia_vencimento: number;
  valor_plano?: number;
  dispositivo_smart?: string;
  aplicativo: string;
  usuario_aplicativo?: string;
  senha_aplicativo?: string;
  data_licenca_aplicativo?: string;
  possui_tela_adicional?: boolean;
  dispositivo_smart_2?: string;
  aplicativo_2?: string;
  usuario_2?: string;
  senha_2?: string;
  data_licenca_2?: string;
  observacoes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limiting - máximo 200 importações por hora
    const { data: rateLimitOk, error: rateLimitError } = await supabaseClient.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_operation: 'import_excel',
      p_max_requests: 200,
      p_time_window_minutes: 60
    });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Limite de importações excedido (máximo 200 por hora). Tente novamente mais tarde.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { clientes } = await req.json()
    
    if (!clientes || !Array.isArray(clientes)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Dados inválidos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const results = []
    const errors = []
    let imported = 0

    console.log(`Processing ${clientes.length} clients for user ${user.id}`)

    for (const clienteData of clientes) {
      try {
        // Validate required fields
        const requiredFields = ['nome', 'servidor', 'aplicativo']
        const missingFields = requiredFields.filter(field => !clienteData[field])
        
        if (missingFields.length > 0) {
          errors.push(`Cliente "${clienteData.nome || 'sem nome'}" possui campos obrigatórios faltando: ${missingFields.join(', ')}`)
          continue
        }

        if (!clienteData.dia_vencimento || isNaN(Number(clienteData.dia_vencimento))) {
          errors.push(`Cliente "${clienteData.nome}" possui dia de vencimento inválido`)
          continue
        }

        // Check if client already exists
        const { data: existingClient, error: checkError } = await supabaseClient
          .from('clientes')
          .select('id, nome')
          .eq('nome', clienteData.nome)
          .eq('servidor', clienteData.servidor)
          .eq('user_id', user.id)
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing client:', checkError)
          errors.push(`Erro ao verificar cliente "${clienteData.nome}": ${checkError.message}`)
          continue
        }

        if (existingClient) {
          console.log('Client already exists, skipping:', clienteData.nome)
          errors.push(`Cliente "${clienteData.nome}" já existe no sistema`)
          continue
        }

        // Use secure creation function
        console.log('Creating client:', clienteData.nome)
        const { data: result, error } = await supabaseClient.rpc('secure_create_cliente', {
          p_cliente_data: {
            ...clienteData,
            user_id: user.id,
            status: 'ativo'
          },
          p_ip_address: req.headers.get('x-forwarded-for') || 'edge-function'
        })

        if (error) {
          console.error('Error creating client:', clienteData.nome, error)
          errors.push(`Erro ao criar cliente "${clienteData.nome}": ${error.message}`)
          continue
        }

        if (result && result.success) {
          imported++
          results.push(result.cliente)
          console.log('Successfully created client:', clienteData.nome)
        } else {
          const errorMsg = result?.error || 'Erro desconhecido'
          errors.push(`Cliente "${clienteData.nome}": ${errorMsg}`)
        }

      } catch (err) {
        console.error('Unexpected error processing client:', clienteData.nome, err)
        errors.push(`Erro inesperado ao processar cliente "${clienteData.nome}"`)
      }
    }

    // Log the import operation
    await supabaseClient.rpc('log_audit_event', {
      p_user_id: user.id,
      p_event_type: 'import_excel',
      p_details: {
        total_clients: clientes.length,
        imported_count: imported,
        errors_count: errors.length,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`Import completed: ${imported}/${clientes.length} successful, ${errors.length} errors`)

    return new Response(
      JSON.stringify({
        success: imported > 0,
        imported,
        total: clientes.length,
        errors,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
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