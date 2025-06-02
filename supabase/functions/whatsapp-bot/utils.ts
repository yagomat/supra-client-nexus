
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
