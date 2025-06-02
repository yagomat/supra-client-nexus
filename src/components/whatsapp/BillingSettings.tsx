
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Template {
  id: string;
  template_name: string;
  category: string;
}

interface BillingSettings {
  id?: string;
  is_active: boolean;
  send_before_days: number[];
  send_after_days: number[];
  send_on_due_date: boolean;
  template_before_id?: string;
  template_on_due_id?: string;
  template_after_id?: string;
}

interface BillingSettingsProps {
  templates: Template[];
}

export const BillingSettings = ({ templates }: BillingSettingsProps) => {
  const [settings, setSettings] = useState<BillingSettings>({
    is_active: false,
    send_before_days: [3, 1],
    send_after_days: [1, 3],
    send_on_due_date: true
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('whatsapp_billing_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading billing settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const settingsData = {
        ...settings,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('whatsapp_billing_settings')
        .upsert(settingsData);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações de cobrança foram salvas com sucesso.",
      });

      // Schedule payment reminders if active
      if (settings.is_active) {
        const { error: scheduleError } = await supabase.functions.invoke('whatsapp-bot', {
          body: {
            action: 'schedule_payment_reminders',
            userId: user.id,
            authToken: (await supabase.auth.getSession()).data.session?.access_token
          }
        });

        if (scheduleError) {
          console.error('Error scheduling reminders:', scheduleError);
        } else {
          toast({
            title: "Lembretes agendados",
            description: "Os lembretes de pagamento foram agendados automaticamente.",
          });
        }
      }

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  };

  const addDay = (type: 'before' | 'after', day: number) => {
    if (type === 'before') {
      if (!settings.send_before_days.includes(day)) {
        setSettings(prev => ({
          ...prev,
          send_before_days: [...prev.send_before_days, day].sort((a, b) => b - a)
        }));
      }
    } else {
      if (!settings.send_after_days.includes(day)) {
        setSettings(prev => ({
          ...prev,
          send_after_days: [...prev.send_after_days, day].sort((a, b) => a - b)
        }));
      }
    }
  };

  const removeDay = (type: 'before' | 'after', day: number) => {
    if (type === 'before') {
      setSettings(prev => ({
        ...prev,
        send_before_days: prev.send_before_days.filter(d => d !== day)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        send_after_days: prev.send_after_days.filter(d => d !== day)
      }));
    }
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Cobrança Automática</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.is_active}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, is_active: checked }))
              }
            />
            <Label>Ativar cobrança automática</Label>
          </div>

          {settings.is_active && (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Enviar ANTES do vencimento</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {settings.send_before_days.map(day => (
                      <Badge key={day} variant="secondary" className="flex items-center gap-1">
                        {day} dia{day > 1 ? 's' : ''}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeDay('before', day)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => addDay('before', parseInt(value))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Adicionar dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 7, 10, 15].map(day => (
                        <SelectItem 
                          key={day} 
                          value={day.toString()}
                          disabled={settings.send_before_days.includes(day)}
                        >
                          {day} dia{day > 1 ? 's' : ''} antes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-2">
                    <Label>Template para mensagens antes do vencimento</Label>
                    <Select 
                      value={settings.template_before_id || ''} 
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, template_before_id: value }))
                      }
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
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.send_on_due_date}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, send_on_due_date: checked }))
                    }
                  />
                  <Label>Enviar NO DIA do vencimento</Label>
                </div>

                {settings.send_on_due_date && (
                  <div>
                    <Label>Template para o dia do vencimento</Label>
                    <Select 
                      value={settings.template_on_due_id || ''} 
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, template_on_due_id: value }))
                      }
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
                )}

                <div>
                  <Label>Enviar DEPOIS do vencimento</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {settings.send_after_days.map(day => (
                      <Badge key={day} variant="secondary" className="flex items-center gap-1">
                        {day} dia{day > 1 ? 's' : ''}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeDay('after', day)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => addDay('after', parseInt(value))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Adicionar dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 7, 10, 15].map(day => (
                        <SelectItem 
                          key={day} 
                          value={day.toString()}
                          disabled={settings.send_after_days.includes(day)}
                        >
                          {day} dia{day > 1 ? 's' : ''} depois
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-2">
                    <Label>Template para mensagens após o vencimento</Label>
                    <Select 
                      value={settings.template_after_id || ''} 
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, template_after_id: value }))
                      }
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
                </div>
              </div>
            </>
          )}

          <Button onClick={saveSettings} className="w-full">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
