
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface PlaceholderSelectorProps {
  availablePlaceholders: string[];
  onPlaceholderSelect: (placeholder: string) => void;
}

export const PlaceholderSelector = ({ availablePlaceholders, onPlaceholderSelect }: PlaceholderSelectorProps) => {
  return (
    <div>
      <Label>Placeholders Disponíveis</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {availablePlaceholders.map(placeholder => (
          <Badge 
            key={placeholder}
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            onClick={() => onPlaceholderSelect(placeholder)}
          >
            {placeholder}
          </Badge>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Clique nos placeholders para inserir na mensagem
      </p>
    </div>
  );
};
