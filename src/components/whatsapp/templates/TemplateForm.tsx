
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceholderSelector } from "./PlaceholderSelector";

interface Template {
  id: string;
  template_name: string;
  message_text: string;
  category: string;
  placeholders: string[];
  is_active: boolean;
  created_at: string;
}

interface TemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: Template | null;
  onRefresh: () => void;
}

export const TemplateForm = ({ isOpen, onClose, editingTemplate, onRefresh }: TemplateFormProps) => {
  const [formData, setFormData] = useState({
    template_name: editingTemplate?.template_name || '',
    message_text: editingTemplate?.message_text || '',
    category: editingTemplate?.category || 'geral'
  });
  const { toast } = useToast();

  const availablePlaceholders = [
    '{nome}', '{telefone}', '{servidor}', '{valor_plano}', 
    '{dia_vencimento}', '{dias_para_vencer}', '{data_vencimento}'
  ];

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Extract placeholders from message text
      const placeholders = availablePlaceholders.filter(placeholder => 
        formData.message_text.includes(placeholder)
      );

      const templateData = {
        ...formData,
        placeholders,
        user_id: user.id
      };

      if (editingTemplate) {
        await supabase
          .from('whatsapp_message_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        toast({
          title: "Template atualizado",
          description: "O template foi atualizado com sucesso.",
        });
      } else {
        await supabase
          .from('whatsapp_message_templates')
          .insert(templateData);
        
        toast({
          title: "Template criado",
          description: "O template foi criado com sucesso.",
        });
      }

      onClose();
      onRefresh();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o template.",
        variant: "destructive"
      });
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setFormData(prev => ({
      ...prev,
      message_text: prev.message_text + placeholder
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingTemplate ? 'Editar Template' : 'Criar Template'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="template_name">Nome do Template</Label>
            <Input
              id="template_name"
              value={formData.template_name}
              onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
              placeholder="Ex: Lembrete de pagamento"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, category: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="cobranca">Cobrança</SelectItem>
                <SelectItem value="boas-vindas">Boas-vindas</SelectItem>
                <SelectItem value="promocional">Promocional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message_text">Mensagem</Label>
            <Textarea
              id="message_text"
              value={formData.message_text}
              onChange={(e) => setFormData(prev => ({ ...prev, message_text: e.target.value }))}
              placeholder="Digite sua mensagem aqui..."
              rows={6}
            />
          </div>

          <PlaceholderSelector 
            availablePlaceholders={availablePlaceholders}
            onPlaceholderSelect={insertPlaceholder}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
