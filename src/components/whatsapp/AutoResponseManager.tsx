
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AutoResponseForm } from "./auto-response/AutoResponseForm";
import { AutoResponseCard } from "./auto-response/AutoResponseCard";

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
  const { toast } = useToast();

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

  const resetForm = () => {
    setEditingResponse(null);
    setFormData({
      trigger_keywords: [],
      response_template: '',
      is_active: true,
      priority: 1,
      match_type: 'contains'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Auto-Respostas</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
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
            <AutoResponseForm
              editingResponse={editingResponse}
              formData={formData}
              onFormDataChange={setFormData}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {autoResponses.map(response => (
          <AutoResponseCard
            key={response.id}
            response={response}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={toggleActive}
          />
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
