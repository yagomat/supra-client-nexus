
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { CampaignForm } from "./bulk/CampaignForm";
import { ClientFilters } from "./bulk/ClientFilters";
import { ClientSelector } from "./bulk/ClientSelector";
import { SendControls } from "./bulk/SendControls";

interface Template {
  id: string;
  template_name: string;
  message_text: string;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  servidor: string;
  uf: string;
}

interface BulkMessagingProps {
  templates: Template[];
}

export const BulkMessaging = ({ templates }: BulkMessagingProps) => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    servidor: '',
    uf: ''
  });
  const [campaign, setCampaign] = useState({
    name: '',
    template_id: '',
    custom_message: '',
    send_interval_min: 30,
    send_interval_max: 300
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, filters]);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone, status, servidor, uf')
        .eq('user_id', user.id)
        .not('telefone', 'is', null);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const applyFilters = () => {
    let filtered = clients;

    if (filters.status) {
      filtered = filtered.filter(client => client.status === filters.status);
    }
    if (filters.servidor) {
      filtered = filtered.filter(client => client.servidor === filters.servidor);
    }
    if (filters.uf) {
      filtered = filtered.filter(client => client.uf === filters.uf);
    }

    setFilteredClients(filtered);
    setSelectedClients([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(filteredClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleClientSelect = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const sendBulkMessage = async () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um cliente.",
        variant: "destructive"
      });
      return;
    }

    if (!campaign.template_id && !campaign.custom_message) {
      toast({
        title: "Erro",
        description: "Selecione um template ou digite uma mensagem personalizada.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('whatsapp_bulk_campaigns')
        .insert({
          user_id: user.id,
          campaign_name: campaign.name || `Campanha ${new Date().toLocaleDateString()}`,
          target_filter: filters,
          message_template_id: campaign.template_id || null,
          message_content: campaign.custom_message || null,
          send_interval_min: campaign.send_interval_min,
          send_interval_max: campaign.send_interval_max,
          status: 'scheduled',
          total_recipients: selectedClients.length
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Get message content
      let messageContent = campaign.custom_message;
      if (campaign.template_id) {
        const template = templates.find(t => t.id === campaign.template_id);
        messageContent = template?.message_text || '';
      }

      // Start bulk sending via Edge Function
      const { error: sendError } = await supabase.functions.invoke('whatsapp-bot', {
        body: {
          action: 'send_bulk_message',
          userId: user.id,
          authToken: (await supabase.auth.getSession()).data.session?.access_token,
          campaignId: campaignData.id,
          targetFilter: filters,
          messageContent,
          sendIntervalMin: campaign.send_interval_min,
          sendIntervalMax: campaign.send_interval_max
        }
      });

      if (sendError) throw sendError;

      toast({
        title: "Campanha iniciada",
        description: `Enviando mensagens para ${selectedClients.length} clientes.`,
      });

      // Reset form
      setCampaign({
        name: '',
        template_id: '',
        custom_message: '',
        send_interval_min: 30,
        send_interval_max: 300
      });
      setSelectedClients([]);

    } catch (error) {
      console.error('Error sending bulk messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a campanha.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Envio em Massa</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CampaignForm
            campaign={campaign}
            templates={templates}
            onCampaignChange={(updates) => setCampaign(prev => ({ ...prev, ...updates }))}
          />

          <ClientFilters
            filters={filters}
            clients={clients}
            onFiltersChange={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
          />

          <ClientSelector
            filteredClients={filteredClients}
            selectedClients={selectedClients}
            onSelectAll={handleSelectAll}
            onClientSelect={handleClientSelect}
          />

          <SendControls
            campaign={campaign}
            selectedClients={selectedClients}
            sending={sending}
            onSend={sendBulkMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
};
