
import { Button } from "@/components/ui/button";
import { Plus, FileUp, Import } from "lucide-react";

interface ValueManagerToolbarProps {
  onAddClick: () => void;
}

export const ValueManagerToolbar = ({ onAddClick }: ValueManagerToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex justify-between gap-2 sm:col-span-2">
        <Button
          variant="outline"
          onClick={() => {/* TODO: Export functionality */}}
          className="flex-1"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {/* TODO: Import functionality */}}
          className="flex-1"
        >
          <Import className="h-4 w-4 mr-2" />
          Importar Excel
        </Button>
      </div>
      
      <Button
        onClick={onAddClick}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </div>
  );
};
