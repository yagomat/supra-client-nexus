
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, LayoutGrid } from "lucide-react";

interface ClienteViewToggleProps {
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
}

export const ClienteViewToggle = ({ viewMode, onViewModeChange }: ClienteViewToggleProps) => {
  return (
    <div className="flex rounded-md border border-input bg-background">
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="rounded-r-none"
      >
        <Table className="h-4 w-4 mr-1" />
        Tabela
      </Button>
      <Button
        variant={viewMode === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('cards')}
        className="rounded-l-none"
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Cards
      </Button>
    </div>
  );
};
