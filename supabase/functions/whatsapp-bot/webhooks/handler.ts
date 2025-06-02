
import { sendMessage } from '../utils.ts'
import { processAutoResponse } from '../actions/auto-response.ts'
import type { WebhookData } from '../types.ts'

export async function handleWebhook(supabase: any, webhookData: WebhookData) {
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

    return { success: true }

  } catch (error) {
    console.error('Webhook error:', error)
    throw error
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
