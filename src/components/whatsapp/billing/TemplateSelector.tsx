
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
  id: string;
  template_name: string;
  category: string;
}

interface TemplateSelectorProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  templates: Template[];
  placeholder?: string;
}

export const TemplateSelector = ({ 
  label, 
  value, 
  onValueChange, 
  templates, 
  placeholder = "Selecione um template" 
}: TemplateSelectorProps) => {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
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
  );
};
