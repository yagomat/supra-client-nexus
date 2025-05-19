
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
      <TableRow>
        {!isMobile && (
          <TableHead className="w-32">
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={() => handleSortToggle('data')}
            >
              Data de Cadastro
              {sortOrder === 'data' ? (
                <ArrowDownIcon className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          </TableHead>
        )}
        <TableHead>
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => handleSortToggle('nome')}
          >
            Cliente
            {sortOrder === 'nome' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        </TableHead>
        <TableHead>
          <div className="leading-tight">
            <div>Dia de</div>
            <div>Venc.</div>
          </div>
        </TableHead>
        {!isMobile && <TableHead>Plano</TableHead>}
        <TableHead>Status</TableHead>
        <TableHead>Pagamento</TableHead>
      </TableRow>
    </TableHeader>
  );
};
