
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Global storage for WhatsApp clients
const whatsappClients = new Map()

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

    const { action, userId, authToken } = await req.json()

    // Validate user authentication
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
      
      case 'getQR':
        return await getQRCode(supabase, user.id)

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
    // Import WhatsApp Web.js dynamically
    const { Client, LocalAuth } = await import('whatsapp-web.js')
    
    // Check if client already exists
    if (whatsappClients.has(userId)) {
      const existingClient = whatsappClients.get(userId)
      if (existingClient.info) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            status: 'already_connected',
            phoneNumber: existingClient.info.wid.user
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create new WhatsApp client
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    })

    // Store client reference
    whatsappClients.set(userId, client)

    // QR Code generation
    client.on('qr', async (qr) => {
      console.log('QR Code generated for user:', userId)
      
      // Update session with QR code
      await supabase
        .from('whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'qr_needed',
          qr_code: qr,
          updated_at: new Date().toISOString()
        })
    })

    // Authentication success
    client.on('authenticated', async () => {
      console.log('WhatsApp authenticated for user:', userId)
      
      await supabase
        .from('whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'authenticating',
          qr_code: null,
          updated_at: new Date().toISOString()
        })
    })

    // Client ready
    client.on('ready', async () => {
      console.log('WhatsApp client ready for user:', userId)
      
      const clientInfo = client.info
      
      await supabase
        .from('whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'connected',
          phone_number: clientInfo.wid.user,
          last_connected: new Date().toISOString(),
          qr_code: null,
          updated_at: new Date().toISOString()
        })

      // Setup heartbeat
      setupHeartbeat(supabase, userId, client)
    })

    // Handle incoming messages
    client.on('message', async (message) => {
      // Only process messages from the authenticated user
      if (message.from === client.info.wid._serialized && !message.fromMe) {
        return
      }

      // Process messages sent by the user to themselves
      if (message.fromMe && message.to === client.info.wid._serialized) {
        await processCommand(supabase, userId, message.body, client)
      }
    })

    // Handle disconnection
    client.on('disconnected', async (reason) => {
      console.log('WhatsApp disconnected for user:', userId, 'Reason:', reason)
      
      await supabase
        .from('whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'disconnected',
          updated_at: new Date().toISOString()
        })

      // Attempt reconnection
      setTimeout(() => attemptReconnection(supabase, userId, client), 5000)
    })

    // Initialize client
    await client.initialize()

    return new Response(
      JSON.stringify({ success: true, status: 'initializing' }),
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

async function processCommand(supabase: any, userId: string, messageText: string, client: any) {
  try {
    console.log('Processing command from user:', userId, 'Message:', messageText)

    // Call database function to process command
    const { data, error } = await supabase.rpc('process_whatsapp_command', {
      p_user_id: userId,
      p_command: messageText,
      p_message_received: messageText
    })

    if (error) {
      console.error('Error processing command:', error)
      await client.sendMessage(client.info.wid._serialized, '❌ Erro interno. Tente novamente.')
      return
    }

    // Send response back to user
    if (data && data.message) {
      await client.sendMessage(client.info.wid._serialized, data.message)
    }

  } catch (error) {
    console.error('Error in processCommand:', error)
    await client.sendMessage(client.info.wid._serialized, '❌ Erro ao processar comando.')
  }
}

async function setupHeartbeat(supabase: any, userId: string, client: any) {
  setInterval(async () => {
    try {
      const state = await client.getState()
      
      if (state !== 'CONNECTED') {
        console.log('Client disconnected, attempting reconnection for user:', userId)
        await attemptReconnection(supabase, userId, client)
      } else {
        // Update last_connected timestamp
        await supabase
          .from('whatsapp_sessions')
          .upsert({
            user_id: userId,
            status: 'connected',
            last_connected: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Heartbeat error for user:', userId, error)
      await attemptReconnection(supabase, userId, client)
    }
  }, 30000) // Check every 30 seconds
}

async function attemptReconnection(supabase: any, userId: string, client: any) {
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      console.log(`Reconnection attempt ${attempts + 1} for user:`, userId)
      
      await supabase
        .from('whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'reconnecting',
          updated_at: new Date().toISOString()
        })

      await client.initialize()
      
      console.log('Reconnection successful for user:', userId)
      return

    } catch (error) {
      attempts++
      console.error(`Reconnection attempt ${attempts} failed for user:`, userId, error)
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, attempts * 5000))
      }
    }
  }

  // All reconnection attempts failed - require new QR
  console.log('All reconnection attempts failed for user:', userId)
  
  await supabase
    .from('whatsapp_sessions')
    .upsert({
      user_id: userId,
      status: 'qr_needed',
      updated_at: new Date().toISOString()
    })
}

async function disconnectWhatsApp(supabase: any, userId: string) {
  try {
    const client = whatsappClients.get(userId)
    
    if (client) {
      await client.destroy()
      whatsappClients.delete(userId)
    }

    await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        status: 'disconnected',
        qr_code: null,
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

async function getQRCode(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('qr_code, status')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        qrCode: data?.qr_code || null,
        status: data?.status || 'disconnected'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error getting QR code:', error)
    throw error
  }
}
