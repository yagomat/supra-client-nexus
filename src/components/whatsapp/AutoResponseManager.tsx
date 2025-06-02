
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AutoResponse {
  id: string;
  trigger_keywords: string[];
  response_template: string;
  is_active: boolean;
  priority: number;
  match_type: string;
}

interface AutoResponseManagerProps {
  autoResponses: AutoResponse[];
  onRefresh: () => void;
}

export const AutoResponseManager = ({ autoResponses, onRefresh }: AutoResponseManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<AutoResponse | null>(null);
  const [formData, setFormData] = useState({
    trigger_keywords: [] as string[],
    response_template: '',
    is_active: true,
    priority: 1,
    match_type: 'contains'
  });
  const [newKeyword, setNewKeyword] = useState('');
  const { toast } = useToast();

  const availablePlaceholders = [
    '{nome}', '{telefone}', '{servidor}', '{valor_plano}', 
    '{dia_vencimento}', '{dias_para_vencer}', '{data_vencimento}'
  ];

  const handleSave = async () => {
    try {
      if (formData.trigger_keywords.length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos uma palavra-chave.",
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const responseData = {
        ...formData,
        user_id: user.id
      };

      if (editingResponse) {
        await supabase
          .from('whatsapp_auto_responses')
          .update(responseData)
          .eq('id', editingResponse.id);
        
        toast({
          title: "Auto-resposta atualizada",
          description: "A auto-resposta foi atualizada com sucesso.",
        });
      } else {
        await supabase
          .from('whatsapp_auto_responses')
          .insert(responseData);
        
        toast({
          title: "Auto-resposta criada",
          description: "A auto-resposta foi criada com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingResponse(null);
      setFormData({
        trigger_keywords: [],
        response_template: '',
        is_active: true,
        priority: 1,
        match_type: 'contains'
      });
      setNewKeyword('');
      onRefresh();
    } catch (error) {
      console.error('Error saving auto-response:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a auto-resposta.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (response: AutoResponse) => {
    setEditingResponse(response);
    setFormData({
      trigger_keywords: response.trigger_keywords,
      response_template: response.response_template,
      is_active: response.is_active,
      priority: response.priority,
      match_type: response.match_type
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (responseId: string) => {
    try {
      await supabase
        .from('whatsapp_auto_responses')
        .delete()
        .eq('id', responseId);
      
      toast({
        title: "Auto-resposta excluída",
        description: "A auto-resposta foi excluída com sucesso.",
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting auto-response:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a auto-resposta.",
        variant: "destructive"
      });
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.trigger_keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        trigger_keywords: [...prev.trigger_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      trigger_keywords: prev.trigger_keywords.filter(k => k !== keyword)
    }));
  };

  const insertPlaceholder = (placeholder: string) => {
    setFormData(prev => ({
      ...prev,
      response_template: prev.response_template + placeholder
    }));
  };

  const toggleActive = async (responseId: string, isActive: boolean) => {
    try {
      await supabase
        .from('whatsapp_auto_responses')
        .update({ is_active: isActive })
        .eq('id', responseId);
      
      onRefresh();
    } catch (error) {
      console.error('Error toggling auto-response:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Auto-Respostas</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingResponse(null);
              setFormData({
                trigger_keywords: [],
                response_template: '',
                is_active: true,
                priority: 1,
                match_type: 'contains'
              });
              setNewKeyword('');
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Auto-Resposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? 'Editar Auto-Resposta' : 'Criar Auto-Resposta'}
              </DialogTitle>
            </DialogHeader>
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, match_type: value }))}
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
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    priority: parseInt(e.target.value) || 1 
                  }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, response_template: e.target.value }))}
                  placeholder="Digite a resposta automática..."
                  rows={4}
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
                <Label>Ativar auto-resposta</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingResponse ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {autoResponses.map(response => (
          <Card key={response.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">Prioridade {response.priority}</Badge>
                    <Badge variant="secondary">{response.match_type}</Badge>
                    {!response.is_active && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {response.trigger_keywords.map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {response.response_template.substring(0, 100)}
                    {response.response_template.length > 100 ? '...' : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={response.is_active}
                    onCheckedChange={(checked) => toggleActive(response.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(response)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(response.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {autoResponses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma auto-resposta configurada. Crie sua primeira auto-resposta para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
