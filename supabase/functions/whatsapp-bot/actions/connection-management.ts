
// Store active sessions in memory
const activeSessions = new Map<string, any>()

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

    console.log('Initializing WhatsApp session for user:', userId)
    
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

    // Note: In a real implementation, this would initialize a WhatsApp Web session
    // For now, we'll simulate the process and generate a mock QR code
    console.log('WhatsApp session initialization started')
    
    // Simulate QR code generation (in a real implementation, this would come from WhatsApp Web)
    const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'qr_needed',
        qr_code: mockQRCode,
        updated_at: new Date().toISOString()
      })

    // Store session placeholder
    activeSessions.set(instanceName, {
      userId,
      status: 'qr_needed',
      instanceName
    })

    return {
      success: true,
      status: 'qr_needed',
      instanceName,
      message: 'QR Code generated. Please scan with WhatsApp to connect.'
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
    
    // Remove session from memory
    if (activeSessions.has(instanceName)) {
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

export function getActiveSession(userId: string): any | null {
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
    const session = getActiveSession(userId)
    if (!session) {
      console.error('No active session for user:', userId)
      return false
    }

    // For now, simulate message sending
    // In a real implementation, this would use the WhatsApp Web client
    console.log(`Simulating message send to ${to}: ${text}`)
    
    // Add a small delay to simulate real sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Message sent successfully (simulated)')
    return true
  } catch (error) {
    console.error('Error sending message:', error)
    return false
  }
}
