
export async function schedulePaymentReminders(supabase: any, userId: string, data: any) {
  try {
    // Get billing settings
    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_billing_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (settingsError || !settings.is_active) {
      throw new Error('Billing reminders not configured or not active')
    }

    // Get active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ativo')

    if (clientsError) throw clientsError

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    let scheduledCount = 0

    for (const client of clients) {
      // Calculate due date for current month
      const dueDate = new Date(currentYear, currentMonth - 1, client.dia_vencimento)
      
      // Schedule before reminders
      for (const days of settings.send_before_days) {
        const reminderDate = new Date(dueDate)
        reminderDate.setDate(reminderDate.getDate() - days)
        
        if (reminderDate > currentDate) {
          await supabase.from('whatsapp_scheduled_messages').insert({
            user_id: userId,
            cliente_id: client.id,
            message_type: 'payment_reminder',
            scheduled_date: reminderDate.toISOString(),
            template_id: settings.template_before_id,
            days_offset: -days
          })
          scheduledCount++
        }
      }

      // Schedule on due date
      if (settings.send_on_due_date && dueDate >= currentDate) {
        await supabase.from('whatsapp_scheduled_messages').insert({
          user_id: userId,
          cliente_id: client.id,
          message_type: 'payment_reminder',
          scheduled_date: dueDate.toISOString(),
          template_id: settings.template_on_due_id,
          days_offset: 0
        })
        scheduledCount++
      }

      // Schedule after reminders
      for (const days of settings.send_after_days) {
        const reminderDate = new Date(dueDate)
        reminderDate.setDate(reminderDate.getDate() + days)
        
        await supabase.from('whatsapp_scheduled_messages').insert({
          user_id: userId,
          cliente_id: client.id,
          message_type: 'payment_reminder',
          scheduled_date: reminderDate.toISOString(),
          template_id: settings.template_after_id,
          days_offset: days
        })
        scheduledCount++
      }
    }

    return {
      success: true, 
      message: `${scheduledCount} payment reminders scheduled for ${clients.length} clients` 
    }

  } catch (error) {
    console.error('Error scheduling payment reminders:', error)
    throw error
  }
}
