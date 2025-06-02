
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

    // Check if this is a webhook from Evolution API (via n8n)
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
      console.log('Processing webhook from Evolution API via n8n')
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

async function callN8nWebhook(webhookUrl: string, data: any) {
  console.log('Calling n8n webhook:', webhookUrl)
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    console.log('n8n webhook response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      throw new Error(`n8n webhook failed: ${errorText}`)
    }

    const result = await response.json()
    console.log('n8n webhook success:', result)
    return result
  } catch (error) {
    console.error('Error calling n8n webhook:', error)
    throw error
  }
}

async function initializeWhatsApp(supabase: any, userId: string) {
  try {
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_SUPABASE_TO_EVOLUTION')
    
    if (!n8nWebhookUrl) {
      throw new Error('n8n webhook não configurado. Configure N8N_WEBHOOK_SUPABASE_TO_EVOLUTION.')
    }

    const instanceName = `user_${userId.substring(0, 8)}`

    // Call n8n webhook to create instance via Evolution API
    console.log('Creating instance via n8n...')
    const result = await callN8nWebhook(n8nWebhookUrl, {
      action: 'create_instance',
      instanceName: instanceName,
      userId: userId
    })

    if (!result.success) {
      throw new Error(result.error || 'Falha ao criar instância via n8n')
    }

    console.log('Instance created successfully via n8n')

    // Get QR Code via n8n
    console.log('Getting QR Code via n8n...')
    const qrResult = await callN8nWebhook(n8nWebhookUrl, {
      action: 'get_qr_code',
      instanceName: instanceName,
      userId: userId
    })

    if (!qrResult.success) {
      throw new Error(qrResult.error || 'Falha ao obter QR Code via n8n')
    }

    console.log('QR Code obtained successfully via n8n')
    
    // Update session in database
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'qr_needed',
        qr_code: qrResult.qr_code,
        session_data: { instanceName },
        updated_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'qr_needed',
        qr_code: qrResult.qr_code,
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
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_SUPABASE_TO_EVOLUTION')
    
    if (!n8nWebhookUrl) {
      throw new Error('n8n webhook não configurado')
    }

    const instanceName = `user_${userId.substring(0, 8)}`

    // Disconnect via n8n
    await callN8nWebhook(n8nWebhookUrl, {
      action: 'disconnect_instance',
      instanceName: instanceName,
      userId: userId
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
    console.log('Webhook received via n8n:', JSON.stringify(webhookData, null, 2))

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

    const userId = instanceName.replace('user_', '')
    
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

    const userId = instanceName.replace('user_', '')
    
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
    const userId = instanceName.replace('user_', '')
    
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

        // Send response back to user via n8n
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
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_SUPABASE_TO_EVOLUTION')
    
    if (!n8nWebhookUrl) {
      console.error('n8n webhook not configured for sending messages')
      return
    }

    await callN8nWebhook(n8nWebhookUrl, {
      action: 'send_message',
      instanceName: instanceName,
      number: remoteJid.replace('@s.whatsapp.net', ''),
      text: text
    })

    console.log('Message sent via n8n successfully')
  } catch (error) {
    console.error('Error sending message via n8n:', error)
  }
}
