
import { supabase } from "@/integrations/supabase/client";

export async function enableRealtimeForClients(): Promise<void> {
  try {
    // Use supabase.rpc with type assertion to call our new function
    await supabase.rpc('enable_realtime_for_clients' as any);
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
