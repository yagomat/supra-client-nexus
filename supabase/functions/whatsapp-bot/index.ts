
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendBulkMessage } from './actions/bulk-messaging.ts'
import { sendTemplateMessage } from './actions/template-messaging.ts'
import { schedulePaymentReminders } from './actions/billing-reminders.ts'
import { processAutoResponse } from './actions/auto-response.ts'
import { initializeWhatsApp, disconnectWhatsApp, getStatus } from './actions/connection-management.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const requestBody = await req.json()
    console.log('Request received:', JSON.stringify(requestBody, null, 2))

    // All requests now require authentication (no more webhook handling)
    const { action, userId, authToken, ...data } = requestBody

    if (!authToken) {
      throw new Error('Missing authentication token')
    }

    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    let result
    switch (action) {
      case 'initialize':
        result = await initializeWhatsApp(supabase, user.id)
        break
      
      case 'disconnect':
        result = await disconnectWhatsApp(supabase, user.id)
        break
      
      case 'status':
        result = await getStatus(supabase, user.id)
        break

      case 'send_bulk_message':
        result = await sendBulkMessage(supabase, user.id, data)
        break

      case 'send_template_message':
        result = await sendTemplateMessage(supabase, user.id, data)
        break

      case 'schedule_payment_reminders':
        result = await schedulePaymentReminders(supabase, user.id, data)
        break

      case 'process_auto_response':
        result = await processAutoResponse(supabase, user.id, data)
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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
