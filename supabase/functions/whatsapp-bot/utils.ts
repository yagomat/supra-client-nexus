
export function replacePlaceholders(text: string, client: any, customData: any = {}) {
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

export async function callN8nWebhook(webhookUrl: string, data: any) {
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

export async function sendMessage(instanceName: string, remoteJid: string, text: string) {
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
