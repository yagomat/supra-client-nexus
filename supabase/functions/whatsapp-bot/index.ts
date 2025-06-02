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

      case 'send_bulk_message':
        return await sendBulkMessage(supabase, user.id, data)

      case 'send_template_message':
        return await sendTemplateMessage(supabase, user.id, data)

      case 'schedule_payment_reminders':
        return await schedulePaymentReminders(supabase, user.id, data)

      case 'process_auto_response':
        return await processAutoResponse(supabase, user.id, data)

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

async function sendBulkMessage(supabase: any, userId: string, data: any) {
  try {
    const { campaignId, targetFilter, messageContent, sendIntervalMin = 30, sendIntervalMax = 300 } = data
    
    // Get clients based on filter
    let clientQuery = supabase.from('clientes').select('*').eq('user_id', userId)
    
    if (targetFilter.status) {
      clientQuery = clientQuery.eq('status', targetFilter.status)
    }
    if (targetFilter.servidor) {
      clientQuery = clientQuery.eq('servidor', targetFilter.servidor)
    }
    if (targetFilter.uf) {
      clientQuery = clientQuery.eq('uf', targetFilter.uf)
    }

    const { data: clients, error: clientError } = await clientQuery
    if (clientError) throw clientError

    // Update campaign with total recipients
    await supabase
      .from('whatsapp_bulk_campaigns')
      .update({ 
        total_recipients: clients.length,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    // Send messages with random intervals
    let sentCount = 0
    for (const client of clients) {
      if (!client.telefone) continue

      try {
        // Replace placeholders in message
        const personalizedMessage = replacePlaceholders(messageContent, client)

        // Send message via n8n
        const instanceName = `user_${userId.substring(0, 8)}`
        await sendMessage(instanceName, client.telefone, personalizedMessage)

        // Log the message
        await supabase.from('whatsapp_message_logs').insert({
          user_id: userId,
          cliente_id: client.id,
          phone_number: client.telefone,
          message_type: 'bulk_campaign',
          message_content: personalizedMessage,
          campaign_id: campaignId
        })

        sentCount++

        // Wait random interval before next message
        const interval = Math.floor(Math.random() * (sendIntervalMax - sendIntervalMin + 1)) + sendIntervalMin
        await new Promise(resolve => setTimeout(resolve, interval * 1000))

      } catch (error) {
        console.error(`Error sending message to ${client.telefone}:`, error)
        
        // Update failed count
        await supabase
          .from('whatsapp_bulk_campaigns')
          .update({ failed_count: supabase.raw('failed_count + 1') })
          .eq('id', campaignId)
      }
    }

    // Mark campaign as completed
    await supabase
      .from('whatsapp_bulk_campaigns')
      .update({ 
        status: 'completed',
        sent_count: sentCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Bulk campaign completed. Sent: ${sentCount}/${clients.length}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in bulk message:', error)
    throw error
  }
}

async function sendTemplateMessage(supabase: any, userId: string, data: any) {
  try {
    const { templateId, clienteId, customData = {} } = data

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('whatsapp_message_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single()

    if (templateError) throw templateError

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .eq('user_id', userId)
      .single()

    if (clientError) throw clientError

    if (!client.telefone) {
      throw new Error('Client has no phone number')
    }

    // Replace placeholders
    const personalizedMessage = replacePlaceholders(template.message_text, client, customData)

    // Send message
    const instanceName = `user_${userId.substring(0, 8)}`
    await sendMessage(instanceName, client.telefone, personalizedMessage)

    // Log the message
    await supabase.from('whatsapp_message_logs').insert({
      user_id: userId,
      cliente_id: client.id,
      phone_number: client.telefone,
      message_type: 'template_message',
      message_content: personalizedMessage,
      template_id: templateId
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Template message sent successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending template message:', error)
    throw error
  }
}

async function schedulePaymentReminders(supabase: any, userId: string, data: any) {
  try {
    // Get billing settings
    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_billing_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (settingsError || !settings.is_active) {
      throw new Error('Billing reminders not configured or not active')
    }

    // Get active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ativo')

    if (clientsError) throw clientsError

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    let scheduledCount = 0

    for (const client of clients) {
      // Calculate due date for current month
      const dueDate = new Date(currentYear, currentMonth - 1, client.dia_vencimento)
      
      // Schedule before reminders
      for (const days of settings.send_before_days) {
        const reminderDate = new Date(dueDate)
        reminderDate.setDate(reminderDate.getDate() - days)
        
        if (reminderDate > currentDate) {
          await supabase.from('whatsapp_scheduled_messages').insert({
            user_id: userId,
            cliente_id: client.id,
            message_type: 'payment_reminder',
            scheduled_date: reminderDate.toISOString(),
            template_id: settings.template_before_id,
            days_offset: -days
          })
          scheduledCount++
        }
      }

      // Schedule on due date
      if (settings.send_on_due_date && dueDate >= currentDate) {
        await supabase.from('whatsapp_scheduled_messages').insert({
          user_id: userId,
          cliente_id: client.id,
          message_type: 'payment_reminder',
          scheduled_date: dueDate.toISOString(),
          template_id: settings.template_on_due_id,
          days_offset: 0
        })
        scheduledCount++
      }

      // Schedule after reminders
      for (const days of settings.send_after_days) {
        const reminderDate = new Date(dueDate)
        reminderDate.setDate(reminderDate.getDate() + days)
        
        await supabase.from('whatsapp_scheduled_messages').insert({
          user_id: userId,
          cliente_id: client.id,
          message_type: 'payment_reminder',
          scheduled_date: reminderDate.toISOString(),
          template_id: settings.template_after_id,
          days_offset: days
        })
        scheduledCount++
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${scheduledCount} payment reminders scheduled for ${clients.length} clients` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error scheduling payment reminders:', error)
    throw error
  }
}

async function processAutoResponse(supabase: any, userId: string, data: any) {
  try {
    const { message, fromPhone } = data

    // Get auto-response rules for user
    const { data: rules, error: rulesError } = await supabase
      .from('whatsapp_auto_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (rulesError) throw rulesError

    // Check each rule for a match
    for (const rule of rules) {
      let isMatch = false
      const messageText = message.toLowerCase()

      for (const keyword of rule.trigger_keywords) {
        const keywordLower = keyword.toLowerCase()
        
        switch (rule.match_type) {
          case 'exact':
            isMatch = messageText === keywordLower
            break
          case 'starts_with':
            isMatch = messageText.startsWith(keywordLower)
            break
          case 'ends_with':
            isMatch = messageText.endsWith(keywordLower)
            break
          case 'contains':
          default:
            isMatch = messageText.includes(keywordLower)
            break
        }

        if (isMatch) break
      }

      if (isMatch) {
        // Find client by phone (if exists)
        const { data: client } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', userId)
          .eq('telefone', fromPhone)
          .single()

        // Replace placeholders in response
        const responseMessage = replacePlaceholders(rule.response_template, client || {})

        // Send auto-response
        const instanceName = `user_${userId.substring(0, 8)}`
        await sendMessage(instanceName, fromPhone, responseMessage)

        // Log the auto-response
        await supabase.from('whatsapp_message_logs').insert({
          user_id: userId,
          cliente_id: client?.id || null,
          phone_number: fromPhone,
          message_type: 'auto_response',
          message_content: responseMessage
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Auto-response sent',
            response: responseMessage
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'No auto-response rule matched' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing auto-response:', error)
    throw error
  }
}

function replacePlaceholders(text: string, client: any, customData: any = {}) {
  let result = text

  // Client placeholders
  if (client.nome) result = result.replace(/{nome}/g, client.nome)
  if (client.telefone) result = result.replace(/{telefone}/g, client.telefone)
  if (client.servidor) result = result.replace(/{servidor}/g, client.servidor)
  if (client.valor_plano) result = result.replace(/{valor_plano}/g, `R$ ${client.valor_plano.toFixed(2)}`)
  if (client.dia_vencimento) {
    result = result.replace(/{dia_vencimento}/g, client.dia_vencimento.toString())
    
    // Calculate days until due date
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    const dueDate = new Date(currentYear, currentMonth - 1, client.dia_vencimento)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    result = result.replace(/{dias_para_vencer}/g, diffDays.toString())
    result = result.replace(/{data_vencimento}/g, dueDate.toLocaleDateString('pt-BR'))
  }

  // Custom data placeholders
  for (const [key, value] of Object.entries(customData)) {
    const placeholder = `{${key}}`
    result = result.replace(new RegExp(placeholder, 'g'), value as string)
  }

  return result
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
    
    // Process auto-responses for incoming messages (not from me)
    if (message.messageType === 'conversation' && !message.fromMe) {
      const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text
      const fromPhone = message.key.remoteJid.replace('@s.whatsapp.net', '')
      
      if (messageText) {
        console.log('Processing auto-response for incoming message:', messageText)
        
        // Call auto-response processing
        await processAutoResponse(supabase, userId, {
          message: messageText,
          fromPhone: fromPhone
        })
      }
    }
    
    // Only process text messages from the user to themselves for commands
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
