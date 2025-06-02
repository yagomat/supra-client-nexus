
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
  id: string;
  template_name: string;
  message_text: string;
  category: string;
  placeholders: string[];
  is_active: boolean;
  created_at: string;
}

interface TemplateManagerProps {
  templates: Template[];
  onRefresh: () => void;
}

export const TemplateManager = ({ templates, onRefresh }: TemplateManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    template_name: '',
    message_text: '',
    category: 'geral'
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

      setIsDialogOpen(false);
      setEditingTemplate(null);
      setFormData({ template_name: '', message_text: '', category: 'geral' });
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

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      message_text: template.message_text,
      category: template.category
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    try {
      await supabase
        .from('whatsapp_message_templates')
        .delete()
        .eq('id', templateId);
      
      toast({
        title: "Template excluído",
        description: "O template foi excluído com sucesso.",
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o template.",
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Templates de Mensagens</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTemplate(null);
              setFormData({ template_name: '', message_text: '', category: 'geral' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
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

              <div>
                <Label>Placeholders Disponíveis</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availablePlaceholders.map(placeholder => (
                    <Badge 
                      key={placeholder}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => insertPlaceholder(placeholder)}
                    >
                      {placeholder}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique nos placeholders para inserir na mensagem
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingTemplate ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{template.template_name}</h4>
                    <Badge variant="secondary">{template.category}</Badge>
                    {!template.is_active && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.message_text.substring(0, 100)}
                    {template.message_text.length > 100 ? '...' : ''}
                  </p>
                  {template.placeholders.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.placeholders.map(placeholder => (
                        <Badge key={placeholder} variant="outline" className="text-xs">
                          {placeholder}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {templates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum template encontrado. Crie seu primeiro template para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
