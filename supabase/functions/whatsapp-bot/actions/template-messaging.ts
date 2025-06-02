
import { replacePlaceholders, sendMessage } from '../utils.ts'
import type { TemplateMessageData } from '../types.ts'

export async function sendTemplateMessage(supabase: any, userId: string, data: TemplateMessageData) {
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

    return {
      success: true, 
      message: 'Template message sent successfully' 
    }

  } catch (error) {
    console.error('Error sending template message:', error)
    throw error
  }
}
