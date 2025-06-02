
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  template_name: string;
  message_text: string;
  category: string;
  placeholders: string[];
  is_active: boolean;
  created_at: string;
}

interface AutoResponse {
  id: string;
  trigger_keywords: string[];
  response_template: string;
  is_active: boolean;
  priority: number;
  match_type: string;
  created_at: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface MessageLog {
  id: string;
  phone_number: string;
  message_type: string;
  message_content: string;
  status: string;
  created_at: string;
}

export const useWhatsAppTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchAutoResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_auto_responses')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setAutoResponses(data || []);
    } catch (error) {
      console.error('Error fetching auto responses:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_bulk_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchMessageLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessageLogs(data || []);
    } catch (error) {
      console.error('Error fetching message logs:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTemplates(),
        fetchAutoResponses(),
        fetchCampaigns(),
        fetchMessageLogs()
      ]);
      setLoading(false);
    };

    loadData();

    // Setup real-time subscriptions
    const templatesChannel = supabase
      .channel('templates-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'whatsapp_message_templates',
        }, 
        () => {
          fetchTemplates();
        }
      )
      .subscribe();

    const autoResponsesChannel = supabase
      .channel('autoresponses-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'whatsapp_auto_responses',
        }, 
        () => {
          fetchAutoResponses();
        }
      )
      .subscribe();

    const campaignsChannel = supabase
      .channel('campaigns-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'whatsapp_bulk_campaigns',
        }, 
        () => {
          fetchCampaigns();
        }
      )
      .subscribe();

    const logsChannel = supabase
      .channel('logs-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'whatsapp_message_logs',
        }, 
        () => {
          fetchMessageLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(templatesChannel);
      supabase.removeChannel(autoResponsesChannel);
      supabase.removeChannel(campaignsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, []);

  return {
    templates,
    autoResponses,
    campaigns,
    messageLogs,
    loading,
    refreshTemplates: fetchTemplates,
    refreshAutoResponses: fetchAutoResponses,
    refreshCampaigns: fetchCampaigns,
    refreshMessageLogs: fetchMessageLogs
  };
};
