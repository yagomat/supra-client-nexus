
import { callN8nWebhook } from '../utils.ts'

export async function initializeWhatsApp(supabase: any, userId: string) {
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

    return {
      success: true, 
      status: 'qr_needed',
      qr_code: qrResult.qr_code,
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
