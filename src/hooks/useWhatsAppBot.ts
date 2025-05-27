
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface WhatsAppSession {
  id: string;
  status: string;
  phone_number?: string;
  qr_code?: string;
  last_connected?: string;
  session_data?: any;
}

interface WhatsAppCommand {
  id: string;
  command: string;
  message_received: string;
  response_sent?: string;
  status: string;
  created_at: string;
}

export const useWhatsAppBot = () => {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [commands, setCommands] = useState<WhatsAppCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSession(data);
    } catch (error) {
      console.error('Error fetching WhatsApp session:', error);
    }
  };

  const fetchCommands = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_commands')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCommands(data || []);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
  };

  const callEdgeFunction = async (action: string, additionalData = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('whatsapp-bot', {
        body: {
          action,
          userId: session.user.id,
          authToken: session.access_token,
          ...additionalData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error calling ${action}:`, error);
      throw error;
    }
  };

  const initialize = async () => {
    try {
      setConnecting(true);
      const result = await callEdgeFunction('initialize');
      
      if (result.success) {
        toast({
          title: "Conectando ao WhatsApp",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        });

        // Refresh session to get QR code
        await fetchSession();
      } else {
        throw new Error(result.error || 'Falha ao inicializar');
      }
    } catch (error) {
      console.error('Initialize error:', error);
      toast({
        title: "Erro ao conectar",
        description: error instanceof Error ? error.message : "Erro desconhecido. Verifique a configuração da API.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await callEdgeFunction('disconnect');
      
      toast({
        title: "Desconectado",
        description: "WhatsApp Bot foi desconectado com sucesso.",
      });

      await fetchSession();
    } catch (error) {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSession(), fetchCommands()]);
      setLoading(false);
    };

    loadData();

    // Setup real-time subscriptions
    const sessionChannel = supabase
      .channel('whatsapp-session-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'whatsapp_sessions',
        }, 
        () => {
          fetchSession();
        }
      )
      .subscribe();

    const commandsChannel = supabase
      .channel('whatsapp-commands-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'whatsapp_commands',
        }, 
        () => {
          fetchCommands();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(commandsChannel);
    };
  }, []);

  return {
    session,
    commands,
    loading,
    connecting,
    initialize,
    disconnect,
    refreshSession: fetchSession,
    refreshCommands: fetchCommands
  };
};
