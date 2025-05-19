
import { supabase } from "@/integrations/supabase/client";

export async function enableRealtimeForClients(): Promise<void> {
  try {
    await supabase.rpc('enable_realtime_for_clients');
  } catch (error) {
    console.error("Error enabling real-time for clients:", error);
    throw error;
  }
}

export async function updateClientStatus(clientId: string, status: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('clientes')
      .update({ status })
      .eq('id', clientId);
      
    if (error) {
      console.error("Error updating client status:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateClientStatus:", error);
    throw error;
  }
}
