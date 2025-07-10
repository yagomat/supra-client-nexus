
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ValueManagerToolbarProps {
  onAddClick: () => void;
}

export const ValueManagerToolbar = ({ onAddClick }: ValueManagerToolbarProps) => {
  return (
    <div className="flex space-x-2">
      <Button
        onClick={onAddClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar dados
      </Button>
    </div>
  );
};
