
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { PlaceholderBadges } from "./PlaceholderBadges";

interface AutoResponse {
  id: string;
  trigger_keywords: string[];
  response_template: string;
  is_active: boolean;
  priority: number;
  match_type: string;
}

interface AutoResponseFormProps {
  editingResponse: AutoResponse | null;
  formData: {
    trigger_keywords: string[];
    response_template: string;
    is_active: boolean;
    priority: number;
    match_type: string;
  };
  onFormDataChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const AutoResponseForm = ({ 
  editingResponse, 
  formData, 
  onFormDataChange, 
  onSave, 
  onCancel 
}: AutoResponseFormProps) => {
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.trigger_keywords.includes(newKeyword.trim())) {
      onFormDataChange({
        ...formData,
        trigger_keywords: [...formData.trigger_keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    onFormDataChange({
      ...formData,
      trigger_keywords: formData.trigger_keywords.filter(k => k !== keyword)
    });
  };

  const insertPlaceholder = (placeholder: string) => {
    onFormDataChange({
      ...formData,
      response_template: formData.response_template + placeholder
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Palavras-chave</Label>
        <div className="flex space-x-2 mt-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Digite uma palavra-chave"
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <Button onClick={addKeyword} type="button">Adicionar</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.trigger_keywords.map(keyword => (
            <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
              {keyword}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeKeyword(keyword)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Tipo de Correspondência</Label>
        <Select 
          value={formData.match_type} 
          onValueChange={(value) => onFormDataChange({ ...formData, match_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">Contém</SelectItem>
            <SelectItem value="exact">Exato</SelectItem>
            <SelectItem value="starts_with">Começa com</SelectItem>
            <SelectItem value="ends_with">Termina com</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Prioridade (1-10)</Label>
        <Input
          type="number"
          min="1"
          max="10"
          value={formData.priority}
          onChange={(e) => onFormDataChange({ 
            ...formData, 
            priority: parseInt(e.target.value) || 1 
          })}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Maior prioridade = processada primeiro
        </p>
      </div>

      <div>
        <Label htmlFor="response_template">Resposta</Label>
        <Textarea
          id="response_template"
          value={formData.response_template}
          onChange={(e) => onFormDataChange({ ...formData, response_template: e.target.value })}
          placeholder="Digite a resposta automática..."
          rows={4}
        />
      </div>

      <PlaceholderBadges onInsertPlaceholder={insertPlaceholder} />

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => 
            onFormDataChange({ ...formData, is_active: checked })
          }
        />
        <Label>Ativar auto-resposta</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSave}>
          {editingResponse ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </div>
  );
};
