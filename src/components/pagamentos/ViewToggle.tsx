
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Grid3X3 } from "lucide-react";

interface ViewToggleProps {
  viewMode: 'lista' | 'matriz';
  onViewModeChange: (mode: 'lista' | 'matriz') => void;
  isMobile?: boolean;
}

export const ViewToggle = ({ 
  viewMode, 
  onViewModeChange,
  isMobile = false 
}: ViewToggleProps) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => value && onViewModeChange(value as 'lista' | 'matriz')}
      className="border rounded-md"
    >
      <ToggleGroupItem 
        value="lista" 
        aria-label="Visualização em lista"
        className="flex items-center gap-2"
      >
        <List className="w-4 h-4" />
        {!isMobile && <span>Lista</span>}
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="matriz" 
        aria-label="Visualização em matriz"
        className="flex items-center gap-2"
      >
        <Grid3X3 className="w-4 h-4" />
        {!isMobile && <span>Matriz</span>}
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
