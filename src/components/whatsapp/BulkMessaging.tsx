
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Clock } from "lucide-react";

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
    setSelectedClients([]); // Reset selection when filters change
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

  const getUniqueValues = (field: keyof Cliente) => {
    return [...new Set(clients.map(client => client[field]).filter(Boolean))];
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
          {/* Campaign Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign_name">Nome da Campanha</Label>
              <Input
                id="campaign_name"
                value={campaign.name}
                onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Promoção Black Friday"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template</Label>
                <Select 
                  value={campaign.template_id} 
                  onValueChange={(value) => setCampaign(prev => ({ ...prev, template_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Intervalo de Envio (segundos)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={campaign.send_interval_min}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      send_interval_min: parseInt(e.target.value) || 30 
                    }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={campaign.send_interval_max}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      send_interval_max: parseInt(e.target.value) || 300 
                    }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="custom_message">Mensagem Personalizada (opcional)</Label>
              <Textarea
                id="custom_message"
                value={campaign.custom_message}
                onChange={(e) => setCampaign(prev => ({ ...prev, custom_message: e.target.value }))}
                placeholder="Digite uma mensagem personalizada (sobrescreve o template)"
                rows={4}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h4 className="font-medium">Filtros de Clientes</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {getUniqueValues('status').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Servidor</Label>
                <Select value={filters.servidor} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, servidor: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {getUniqueValues('servidor').map(servidor => (
                      <SelectItem key={servidor} value={servidor}>{servidor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>UF</Label>
                <Select value={filters.uf} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, uf: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {getUniqueValues('uf').map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Client Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">
                Clientes ({filteredClients.length} encontrados)
              </h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label>Selecionar todos</Label>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-4">
              {filteredClients.map(client => (
                <div key={client.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) => handleClientSelect(client.id, checked as boolean)}
                  />
                  <span className="flex-1">{client.nome}</span>
                  <Badge variant="outline">{client.status}</Badge>
                  <span className="text-sm text-muted-foreground">{client.telefone}</span>
                </div>
              ))}
              
              {filteredClients.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum cliente encontrado com os filtros aplicados.
                </p>
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Intervalo: {campaign.send_interval_min}s - {campaign.send_interval_max}s
              </span>
            </div>
            <Button 
              onClick={sendBulkMessage} 
              disabled={sending || selectedClients.length === 0}
              className="min-w-[150px]"
            >
              {sending ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para {selectedClients.length} cliente{selectedClients.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
