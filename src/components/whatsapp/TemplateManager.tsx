
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TemplateForm } from "./templates/TemplateForm";
import { TemplateCard } from "./templates/TemplateCard";

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

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Templates de Mensagens</h3>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEdit}
            onRefresh={onRefresh}
          />
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

      <TemplateForm
        isOpen={isDialogOpen}
        onClose={handleClose}
        editingTemplate={editingTemplate}
        onRefresh={onRefresh}
      />
    </div>
  );
};
