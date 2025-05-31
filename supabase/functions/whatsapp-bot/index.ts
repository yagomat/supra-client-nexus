
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
    const isWebhook = !!(
      requestBody.event || 
      requestBody.instance || 
      requestBody.data ||
      requestBody.destination ||
      requestBody.server_url ||
      requestBody.apikey ||
      (!requestBody.action && !requestBody.userId && !requestBody.authToken)
    )

    if (isWebhook) {
      console.log('Processing webhook from Evolution API')
      return await handleWebhook(supabase, requestBody)
    }

    // For non-webhook requests (user actions), require authentication
    const { action, userId, authToken, ...data } = requestBody

    if (!authToken) {
      throw new Error('Missing authentication token for user action')
    }

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

    // Create instance with explicit integration configuration
    console.log('Creating instance with explicit integration configuration...')
    const createInstanceResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      body: JSON.stringify({
        instanceName: instanceName,
        qrcode: true,
        integration: {
          type: "wpp"
        }
      })
    })

    if (!createInstanceResponse.ok) {
      const errorData = await createInstanceResponse.text()
      console.error('Failed to create instance:', errorData)
      
      // Try alternative approach without integration parameter
      console.log('Trying alternative approach without integration parameter...')
      const alternativeResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true
        })
      })

      if (!alternativeResponse.ok) {
        const altErrorData = await alternativeResponse.text()
        console.error('Alternative approach also failed:', altErrorData)
        throw new Error('Falha ao criar instância do WhatsApp. Verifique a configuração da Evolution API.')
      }
    }

    console.log('Instance created successfully')

    // Get QR Code
    console.log('Getting QR Code...')
    const connectResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': evolutionApiKey
      }
    })

    if (!connectResponse.ok) {
      const errorData = await connectResponse.text()
      console.error('Failed to get QR Code:', errorData)
      throw new Error('Falha ao obter QR Code')
    }

    const connectData = await connectResponse.json()
    console.log('QR Code obtained successfully')
    
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

    // Handle different event types from Evolution API
    if (webhookData.event) {
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
    } else {
      console.log('Webhook received without event type, processing as generic webhook')
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
  try {
    const instanceName = data.instance
    if (!instanceName) {
      console.error('No instance name in QR code update')
      return
    }

    const userId = instanceName.replace('whatsapp_', '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
    
    const qrCode = data.data?.qrcode?.base64 || data.data?.qrcode?.code || data.data?.code
    
    console.log('Updating QR Code for user:', userId, 'QR available:', !!qrCode)
    
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'qr_needed',
        qr_code: qrCode,
        updated_at: new Date().toISOString()
      })

    console.log('QR Code updated successfully for user:', userId)
  } catch (error) {
    console.error('Error handling QR code update:', error)
  }
}

async function handleConnectionUpdate(supabase: any, data: any) {
  try {
    const instanceName = data.instance
    if (!instanceName) {
      console.error('No instance name in connection update')
      return
    }

    const userId = instanceName.replace('whatsapp_', '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
    
    let status = 'disconnected'
    let phoneNumber = null
    
    if (data.data?.state === 'open') {
      status = 'connected'
      phoneNumber = data.data?.user?.id || null
    } else if (data.data?.state === 'connecting') {
      status = 'connecting'
    }
    
    console.log('Updating connection status for user:', userId, 'Status:', status, 'Phone:', phoneNumber)
    
    const updateData: any = {
      user_id: userId,
      status: status,
      phone_number: phoneNumber,
      updated_at: new Date().toISOString()
    }

    if (status === 'connected') {
      updateData.last_connected = new Date().toISOString()
      updateData.qr_code = null
    }
    
    await supabase
      .from('whatsapp_sessions')
      .upsert(updateData)

    console.log('Connection status updated successfully for user:', userId)
  } catch (error) {
    console.error('Error handling connection update:', error)
  }
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
