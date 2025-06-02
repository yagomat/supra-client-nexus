
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DaysManager } from "./DaysManager";
import { TemplateSelector } from "./TemplateSelector";

interface Template {
  id: string;
  template_name: string;
  category: string;
}

interface BillingSettings {
  send_before_days: number[];
  send_after_days: number[];
  send_on_due_date: boolean;
  template_before_id?: string;
  template_on_due_id?: string;
  template_after_id?: string;
}

interface BillingConfigSectionProps {
  settings: BillingSettings;
  templates: Template[];
  onSettingsChange: (updates: Partial<BillingSettings>) => void;
  onAddDay: (type: 'before' | 'after', day: number) => void;
  onRemoveDay: (type: 'before' | 'after', day: number) => void;
}

export const BillingConfigSection = ({ 
  settings, 
  templates, 
  onSettingsChange, 
  onAddDay, 
  onRemoveDay 
}: BillingConfigSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <DaysManager
          label="Enviar ANTES do vencimento"
          days={settings.send_before_days}
          onAddDay={(day) => onAddDay('before', day)}
          onRemoveDay={(day) => onRemoveDay('before', day)}
          placeholder="Adicionar dia"
        />
        
        <div className="mt-2">
          <TemplateSelector
            label="Template para mensagens antes do vencimento"
            value={settings.template_before_id || ''}
            onValueChange={(value) => onSettingsChange({ template_before_id: value })}
            templates={templates}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={settings.send_on_due_date}
          onCheckedChange={(checked) => onSettingsChange({ send_on_due_date: checked })}
        />
        <Label>Enviar NO DIA do vencimento</Label>
      </div>

      {settings.send_on_due_date && (
        <TemplateSelector
          label="Template para o dia do vencimento"
          value={settings.template_on_due_id || ''}
          onValueChange={(value) => onSettingsChange({ template_on_due_id: value })}
          templates={templates}
        />
      )}

      <div>
        <DaysManager
          label="Enviar DEPOIS do vencimento"
          days={settings.send_after_days}
          onAddDay={(day) => onAddDay('after', day)}
          onRemoveDay={(day) => onRemoveDay('after', day)}
          placeholder="Adicionar dia"
        />
        
        <div className="mt-2">
          <TemplateSelector
            label="Template para mensagens após o vencimento"
            value={settings.template_after_id || ''}
            onValueChange={(value) => onSettingsChange({ template_after_id: value })}
            templates={templates}
          />
        </div>
      </div>
    </div>
  );
};
