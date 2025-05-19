
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";

interface ValueManagerToolbarProps {
  onAddClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
}

export const ValueManagerToolbar = ({ onAddClick, onImportClick, onExportClick }: ValueManagerToolbarProps) => {
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
      <Button
        variant="outline"
        size="sm"
        onClick={onImportClick}
      >
        <Upload className="h-4 w-4 mr-2" />
        Importar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportClick}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </div>
  );
};
