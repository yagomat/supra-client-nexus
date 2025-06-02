
import { sendMessage } from './connection-management.ts'
import { replacePlaceholders } from '../utils.ts'
import type { BulkMessageData } from '../types.ts'

export async function sendBulkMessage(supabase: any, userId: string, data: BulkMessageData) {
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

        // Send message via Venom-bot
        const success = await sendMessage(userId, client.telefone, personalizedMessage)
        
        if (success) {
          // Log the message
          await supabase.from('whatsapp_message_logs').insert({
            user_id: userId,
            cliente_id: client.id,
            phone_number: client.telefone,
            message_type: 'bulk_campaign',
            message_content: personalizedMessage,
            campaign_id: campaignId,
            status: 'sent'
          })

          sentCount++
        } else {
          // Log failed message
          await supabase.from('whatsapp_message_logs').insert({
            user_id: userId,
            cliente_id: client.id,
            phone_number: client.telefone,
            message_type: 'bulk_campaign',
            message_content: personalizedMessage,
            campaign_id: campaignId,
            status: 'failed'
          })
        }

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

    return {
      success: true, 
      message: `Bulk campaign completed. Sent: ${sentCount}/${clients.length}` 
    }

  } catch (error) {
    console.error('Error in bulk message:', error)
    throw error
  }
}
