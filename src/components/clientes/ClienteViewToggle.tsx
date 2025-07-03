
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Grid3X3 } from "lucide-react";

interface ClienteViewToggleProps {
  viewMode: 'cards' | 'matriz';
  onViewModeChange: (mode: 'cards' | 'matriz') => void;
}

export const ClienteViewToggle = ({ viewMode, onViewModeChange }: ClienteViewToggleProps) => {
  return (
    <div className="flex rounded-md border border-input bg-background">
      <Button
        variant={viewMode === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('cards')}
        className="rounded-r-none"
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Cards
      </Button>
      <Button
        variant={viewMode === 'matriz' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('matriz')}
        className="rounded-l-none"
      >
        <Grid3X3 className="h-4 w-4 mr-1" />
        Matriz
      </Button>
    </div>
  );
};
