
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";

interface AutoResponse {
  id: string;
  trigger_keywords: string[];
  response_template: string;
  is_active: boolean;
  priority: number;
  match_type: string;
}

interface AutoResponseCardProps {
  response: AutoResponse;
  onEdit: (response: AutoResponse) => void;
  onDelete: (responseId: string) => void;
  onToggleActive: (responseId: string, isActive: boolean) => void;
}

export const AutoResponseCard = ({ 
  response, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: AutoResponseCardProps) => {
  return (
    <Card>
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
              onCheckedChange={(checked) => onToggleActive(response.id, checked)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(response)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(response.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
