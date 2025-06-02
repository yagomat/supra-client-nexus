
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2 } from "lucide-react";

interface Template {
  id: string;
  template_name: string;
  message_text: string;
  category: string;
  placeholders: string[];
  is_active: boolean;
  created_at: string;
}

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onRefresh: () => void;
}

export const TemplateCard = ({ template, onEdit, onRefresh }: TemplateCardProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await supabase
        .from('whatsapp_message_templates')
        .delete()
        .eq('id', template.id);
      
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

  return (
    <Card>
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
              onClick={() => onEdit(template)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
