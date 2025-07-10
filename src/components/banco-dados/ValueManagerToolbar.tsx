
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ValueManagerToolbarProps {
  onAddClick: () => void;
}

export const ValueManagerToolbar = ({ onAddClick }: ValueManagerToolbarProps) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </div>
  );
};
