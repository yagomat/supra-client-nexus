
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
  id: string;
  template_name: string;
  message_text: string;
}

interface Campaign {
  name: string;
  template_id: string;
  custom_message: string;
  send_interval_min: number;
  send_interval_max: number;
}

interface CampaignFormProps {
  campaign: Campaign;
  templates: Template[];
  onCampaignChange: (updates: Partial<Campaign>) => void;
}

export const CampaignForm = ({ campaign, templates, onCampaignChange }: CampaignFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="campaign_name">Nome da Campanha</Label>
        <Input
          id="campaign_name"
          value={campaign.name}
          onChange={(e) => onCampaignChange({ name: e.target.value })}
          placeholder="Ex: Promoção Black Friday"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Template</Label>
          <Select 
            value={campaign.template_id} 
            onValueChange={(value) => onCampaignChange({ template_id: value })}
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
              onChange={(e) => onCampaignChange({ 
                send_interval_min: parseInt(e.target.value) || 30 
              })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={campaign.send_interval_max}
              onChange={(e) => onCampaignChange({ 
                send_interval_max: parseInt(e.target.value) || 300 
              })}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="custom_message">Mensagem Personalizada (opcional)</Label>
        <Textarea
          id="custom_message"
          value={campaign.custom_message}
          onChange={(e) => onCampaignChange({ custom_message: e.target.value })}
          placeholder="Digite uma mensagem personalizada (sobrescreve o template)"
          rows={4}
        />
      </div>
    </div>
  );
};
