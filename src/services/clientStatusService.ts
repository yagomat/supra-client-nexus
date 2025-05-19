
import { supabase } from "@/integrations/supabase/client";

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

export async function enableRealtimeForTable(tableName: string): Promise<void> {
  try {
    // Set REPLICA IDENTITY to FULL for the table
    const { error } = await supabase.rpc('add_table_to_publication', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Error enabling realtime for ${tableName}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error in enableRealtimeForTable for ${tableName}:`, error);
    throw error;
  }
}
