import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('Request received:', JSON.stringify(requestBody, null, 2))

    // Check if this is a webhook from Evolution API
    const isWebhook = requestBody.event || requestBody.instance || 
                     (!requestBody.action && !requestBody.userId)

    if (isWebhook) {
      // Handle webhook without authentication
      console.log('Processing webhook from Evolution API')
      return await handleWebhook(supabase, requestBody)
    }

    // For non-webhook requests, require authentication
    const { action, userId, authToken, ...data } = requestBody

    // Validate user authentication for user actions
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    switch (action) {
      case 'initialize':
        return await initializeWhatsApp(supabase, user.id)
      
      case 'disconnect':
        return await disconnectWhatsApp(supabase, user.id)
      
      case 'status':
        return await getStatus(supabase, user.id)

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('WhatsApp Bot Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function initializeWhatsApp(supabase: any, userId: string) {
  try {
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    
    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API não configurada. Configure EVOLUTION_API_URL e EVOLUTION_API_KEY.')
    }

    const instanceName = `whatsapp_${userId.replace(/-/g, '')}`

    // Create or get instance
    const createInstanceResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      body: JSON.stringify({
        instanceName: instanceName,
        token: evolutionApiKey,
        qrcode: true,
        webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-bot`,
        webhook_by_events: false,
        webhook_base64: false,
        events: [
          "APPLICATION_STARTUP",
          "QRCODE_UPDATED", 
          "CONNECTION_UPDATE",
          "MESSAGES_UPSERT"
        ]
      })
    })

    if (!createInstanceResponse.ok) {
      const errorData = await createInstanceResponse.text()
      console.error('Failed to create instance:', errorData)
      throw new Error('Falha ao criar instância do WhatsApp')
    }

    // Get QR Code
    const connectResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': evolutionApiKey
      }
    })

    if (!connectResponse.ok) {
      throw new Error('Falha ao obter QR Code')
    }

    const connectData = await connectResponse.json()
    
    // Update session in database
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'qr_needed',
        qr_code: connectData.base64 || connectData.code,
        session_data: { instanceName },
        updated_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'qr_needed',
        qr_code: connectData.base64 || connectData.code,
        instanceName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error initializing WhatsApp:', error)
    
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'error',
        updated_at: new Date().toISOString()
      })

    throw error
  }
}

async function disconnectWhatsApp(supabase: any, userId: string) {
  try {
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    
    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API não configurada')
    }

    const instanceName = `whatsapp_${userId.replace(/-/g, '')}`

    // Disconnect instance
    const disconnectResponse = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': evolutionApiKey
      }
    })

    // Update session regardless of API response
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'disconnected',
        qr_code: null,
        phone_number: null,
        updated_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ success: true, status: 'disconnected' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error)
    throw error
  }
}

async function getStatus(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: data || { status: 'disconnected' }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error getting status:', error)
    throw error
  }
}

async function handleWebhook(supabase: any, webhookData: any) {
  try {
    console.log('Webhook received:', JSON.stringify(webhookData, null, 2))

    // Handle different event types
    switch (webhookData.event) {
      case 'qrcode.updated':
        await handleQRCodeUpdate(supabase, webhookData)
        break
        
      case 'connection.update':
        await handleConnectionUpdate(supabase, webhookData)
        break
        
      case 'messages.upsert':
        await handleMessage(supabase, webhookData)
        break
        
      default:
        console.log('Unhandled webhook event:', webhookData.event)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleQRCodeUpdate(supabase: any, data: any) {
  const instanceName = data.instance
  const userId = instanceName.replace('whatsapp_', '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
  
  await supabase
    .from('whatsapp_sessions')
    .upsert({
      user_id: userId,
      status: 'qr_needed',
      qr_code: data.data.qrcode,
      updated_at: new Date().toISOString()
    })
}

async function handleConnectionUpdate(supabase: any, data: any) {
  const instanceName = data.instance
  const userId = instanceName.replace('whatsapp_', '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
  
  let status = 'disconnected'
  let phoneNumber = null
  
  if (data.data.state === 'open') {
    status = 'connected'
    phoneNumber = data.data.user?.id || null
  } else if (data.data.state === 'connecting') {
    status = 'connecting'
  }
  
  await supabase
    .from('whatsapp_sessions')
    .upsert({
      user_id: userId,
      status: status,
      phone_number: phoneNumber,
      last_connected: status === 'connected' ? new Date().toISOString() : undefined,
      qr_code: status === 'connected' ? null : undefined,
      updated_at: new Date().toISOString()
    })
}

async function handleMessage(supabase: any, data: any) {
  try {
    const message = data.data
    const instanceName = data.instance
    const userId = instanceName.replace('whatsapp_', '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
    
    // Only process text messages from the user to themselves
    if (message.messageType === 'conversation' && message.fromMe) {
      const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text
      
      if (messageText) {
        console.log('Processing command from user:', userId, 'Message:', messageText)

        // Call database function to process command
        const { data: commandResult, error } = await supabase.rpc('process_whatsapp_command', {
          p_user_id: userId,
          p_command: messageText,
          p_message_received: messageText
        })

        if (error) {
          console.error('Error processing command:', error)
          await sendMessage(instanceName, message.key.remoteJid, '❌ Erro interno. Tente novamente.')
          return
        }

        // Send response back to user
        if (commandResult && commandResult.message) {
          await sendMessage(instanceName, message.key.remoteJid, commandResult.message)
        }
      }
    }
  } catch (error) {
    console.error('Error handling message:', error)
  }
}

async function sendMessage(instanceName: string, remoteJid: string, text: string) {
  try {
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    
    const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      body: JSON.stringify({
        number: remoteJid.replace('@s.whatsapp.net', ''),
        text: text
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}
