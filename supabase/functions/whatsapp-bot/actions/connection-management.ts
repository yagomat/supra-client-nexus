
import { create, Whatsapp } from 'venom-bot'

// Store active sessions in memory
const activeSessions = new Map<string, Whatsapp>()

export async function initializeWhatsApp(supabase: any, userId: string) {
  try {
    const instanceName = `user_${userId.substring(0, 8)}`
    
    // Check if session already exists
    if (activeSessions.has(instanceName)) {
      console.log('Session already exists for user:', userId)
      return {
        success: true,
        status: 'connecting',
        message: 'Session already initializing'
      }
    }

    console.log('Creating new Venom-bot session for user:', userId)
    
    // Update session status to connecting
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'connecting',
        qr_code: null,
        updated_at: new Date().toISOString(),
        session_data: { instanceName }
      })

    // Create Venom-bot session
    const client = await create({
      session: instanceName,
      multidevice: true,
      headless: true,
      devtools: false,
      useChrome: false,
      debug: false,
      logQR: false,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      // QR Code callback
      catchQR: async (base64Qr: string, asciiQR: string, attempts: number) => {
        console.log(`QR Code generated for ${instanceName}, attempt ${attempts}`)
        
        await supabase
          .from('whatsapp_sessions')
          .upsert({
            user_id: userId,
            status: 'qr_needed',
            qr_code: base64Qr,
            updated_at: new Date().toISOString()
          })
      },
      // Status callback
      statusFind: async (statusSession: string, session: string) => {
        console.log(`Status for ${session}: ${statusSession}`)
        
        let status = 'connecting'
        let phoneNumber = null
        
        if (statusSession === 'authenticated') {
          status = 'connected'
          // Get phone number from client
          try {
            const hostDevice = await client.getHostDevice()
            phoneNumber = hostDevice.id.user
          } catch (error) {
            console.log('Could not get phone number:', error)
          }
        } else if (statusSession === 'qrReadSuccess') {
          status = 'authenticating'
        } else if (statusSession === 'disconnected') {
          status = 'disconnected'
          activeSessions.delete(instanceName)
        }
        
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
      }
    })

    // Store session
    activeSessions.set(instanceName, client)

    // Set up message listeners
    client.onMessage(async (message: any) => {
      await handleIncomingMessage(supabase, userId, message, instanceName)
    })

    return {
      success: true,
      status: 'connecting',
      instanceName
    }

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

export async function disconnectWhatsApp(supabase: any, userId: string) {
  try {
    const instanceName = `user_${userId.substring(0, 8)}`
    
    // Get session
    const client = activeSessions.get(instanceName)
    if (client) {
      await client.close()
      activeSessions.delete(instanceName)
    }

    // Update session in database
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'disconnected',
        qr_code: null,
        phone_number: null,
        updated_at: new Date().toISOString()
      })

    return { success: true, status: 'disconnected' }

  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error)
    throw error
  }
}

export async function getStatus(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return { 
      success: true, 
      session: data || { status: 'disconnected' }
    }

  } catch (error) {
    console.error('Error getting status:', error)
    throw error
  }
}

export function getActiveSession(userId: string): Whatsapp | null {
  const instanceName = `user_${userId.substring(0, 8)}`
  return activeSessions.get(instanceName) || null
}

async function handleIncomingMessage(supabase: any, userId: string, message: any, instanceName: string) {
  try {
    // Process auto-responses for incoming messages (not from me)
    if (message.type === 'chat' && !message.fromMe && message.body) {
      console.log('Processing auto-response for incoming message:', message.body)
      
      const fromPhone = message.from.replace('@c.us', '')
      
      // Call auto-response processing
      await processAutoResponse(supabase, userId, {
        message: message.body,
        fromPhone: fromPhone
      })
    }
    
    // Process commands if message is from the user to themselves
    if (message.type === 'chat' && message.fromMe && message.body) {
      console.log('Processing command from user:', userId, 'Message:', message.body)

      // Call database function to process command
      const { data: commandResult, error } = await supabase.rpc('process_whatsapp_command', {
        p_user_id: userId,
        p_command: message.body,
        p_message_received: message.body
      })

      if (error) {
        console.error('Error processing command:', error)
        await sendMessage(userId, message.from, '❌ Erro interno. Tente novamente.')
        return
      }

      // Send response back to user
      if (commandResult && commandResult.message) {
        await sendMessage(userId, message.from, commandResult.message)
      }
    }
  } catch (error) {
    console.error('Error handling incoming message:', error)
  }
}

async function processAutoResponse(supabase: any, userId: string, data: any) {
  // Import and call the existing auto-response logic
  const { processAutoResponse: processAutoResponseAction } = await import('./auto-response.ts')
  return await processAutoResponseAction(supabase, userId, data)
}

export async function sendMessage(userId: string, to: string, text: string): Promise<boolean> {
  try {
    const client = getActiveSession(userId)
    if (!client) {
      console.error('No active session for user:', userId)
      return false
    }

    // Clean phone number format
    const phoneNumber = to.replace('@c.us', '').replace('@s.whatsapp.net', '')
    const formattedNumber = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`
    
    await client.sendText(formattedNumber, text)
    console.log('Message sent successfully via Venom-bot')
    return true
  } catch (error) {
    console.error('Error sending message via Venom-bot:', error)
    return false
  }
}
