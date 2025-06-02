
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface PlaceholderBadgesProps {
  onInsertPlaceholder: (placeholder: string) => void;
}

export const PlaceholderBadges = ({ onInsertPlaceholder }: PlaceholderBadgesProps) => {
  const availablePlaceholders = [
    '{nome}', '{telefone}', '{servidor}', '{valor_plano}', 
    '{dia_vencimento}', '{dias_para_vencer}', '{data_vencimento}'
  ];

  return (
    <div>
      <Label>Placeholders Disponíveis</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {availablePlaceholders.map(placeholder => (
          <Badge 
            key={placeholder}
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            onClick={() => onInsertPlaceholder(placeholder)}
          >
            {placeholder}
          </Badge>
        ))}
      </div>
    </div>
  );
};
