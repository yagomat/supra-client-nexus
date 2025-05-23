
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableHeaderProps {
  isMobile?: boolean;
  sortOrder?: 'nome' | 'data';
  onSortChange?: (sortOrder: 'nome' | 'data') => void;
}

export const TableHeaderComponent = ({
  isMobile = false,
  sortOrder = 'data',
  onSortChange
}: TableHeaderProps) => {
  const handleSortToggle = (field: 'nome' | 'data') => {
    if (onSortChange) {
      onSortChange(field);
    }
  };
  
  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        {!isMobile && (
          <TableHead className="w-32">
            <Button
              variant="ghost"
              className="flex items-center font-medium -ml-2"
              onClick={() => handleSortToggle('data')}
            >
              Data de Cadastro
              {sortOrder === 'data' ? (
                <ArrowDownIcon className="ml-2 h-4 w-4 opacity-70" />
              ) : null}
            </Button>
          </TableHead>
        )}
        <TableHead>
          <Button
            variant="ghost"
            className="flex items-center font-medium -ml-2"
            onClick={() => handleSortToggle('nome')}
          >
            Cliente
            {sortOrder === 'nome' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4 opacity-70" />
            ) : null}
          </Button>
        </TableHead>
        <TableHead>
          <div className="leading-tight font-medium">
            <div>Dia de</div>
            <div>Venc.</div>
          </div>
        </TableHead>
        {!isMobile && <TableHead className="font-medium">Plano</TableHead>}
        <TableHead className="font-medium">Status</TableHead>
        <TableHead className="font-medium">Pagamento</TableHead>
      </TableRow>
    </TableHeader>
  );
};
