
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Chave secreta para CSRF (deve ser definida nas secrets do Supabase)
const CSRF_SECRET = Deno.env.get('CSRF_SECRET_KEY') || 'default-secret-key-change-in-production'

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

    const requestBody = await req.json()
    const action = requestBody.action

    if (action === 'generate') {
      // Gerar novo token CSRF
      const timestamp = Date.now().toString()
      const userId = user.id
      const origin = req.headers.get('origin') || ''
      
      // Criar token com informações de contexto
      const tokenData = `${timestamp}-${userId}-${origin}`
      const encoder = new TextEncoder()
      const data = encoder.encode(tokenData + CSRF_SECRET)
      
      // Gerar hash do token
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      const token = btoa(`${tokenData}-${hashHex}`).replace(/[+/=]/g, '')
      
      // Log de geração de token
      await supabaseClient.rpc('log_audit_event', {
        p_user_id: user.id,
        p_event_type: 'csrf_token_generated',
        p_details: {
          timestamp: new Date().toISOString(),
          origin,
          token_length: token.length
        }
      })

      return new Response(
        JSON.stringify({
          success: true,
          token,
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hora
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'validate') {
      // Validar token CSRF
      const { token, origin: requestOrigin } = requestBody
      
      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: 'Token não fornecido' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      try {
        const decoded = atob(token)
        const parts = decoded.split('-')
        
        if (parts.length < 4) {
          throw new Error('Token com formato inválido')
        }

        const [timestamp, tokenUserId, origin, providedHash] = parts
        
        // Verificar se não expirou (1 hora)
        const tokenTime = parseInt(timestamp)
        if (Date.now() - tokenTime > 3600000) {
          throw new Error('Token expirado')
        }

        // Verificar se é do mesmo usuário
        if (tokenUserId !== user.id) {
          throw new Error('Token não pertence ao usuário')
        }

        // Verificar origem se fornecida
        if (requestOrigin && origin !== requestOrigin) {
          throw new Error('Origem do token não confere')
        }

        // Verificar hash do token
        const tokenData = `${timestamp}-${tokenUserId}-${origin}`
        const encoder = new TextEncoder()
        const data = encoder.encode(tokenData + CSRF_SECRET)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const expectedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        if (providedHash !== expectedHash) {
          throw new Error('Hash do token inválido')
        }

        // Log de validação bem-sucedida
        await supabaseClient.rpc('log_audit_event', {
          p_user_id: user.id,
          p_event_type: 'csrf_token_validated',
          p_details: {
            timestamp: new Date().toISOString(),
            token_age_minutes: Math.floor((Date.now() - tokenTime) / 60000),
            origin: requestOrigin
          }
        })

        return new Response(
          JSON.stringify({
            success: true,
            valid: true,
            message: 'Token válido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      } catch (error) {
        // Log de validação falhou
        await supabaseClient.rpc('log_audit_event', {
          p_user_id: user.id,
          p_event_type: 'csrf_token_validation_failed',
          p_details: {
            timestamp: new Date().toISOString(),
            error: error.message,
            origin: requestOrigin
          }
        })

        return new Response(
          JSON.stringify({
            success: false,
            valid: false,
            error: error.message
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Ação não reconhecida' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('CSRF Function error:', error)
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
