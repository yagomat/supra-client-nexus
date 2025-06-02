
import { replacePlaceholders, sendMessage } from '../utils.ts'
import type { AutoResponseData } from '../types.ts'

export async function processAutoResponse(supabase: any, userId: string, data: AutoResponseData) {
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

        return {
          success: true, 
          message: 'Auto-response sent',
          response: responseMessage
        }
      }
    }

    return {
      success: false, 
      message: 'No auto-response rule matched' 
    }

  } catch (error) {
    console.error('Error processing auto-response:', error)
    throw error
  }
}
