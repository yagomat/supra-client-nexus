
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

interface TableHeaderComponentProps {
  isMobile?: boolean;
  sortOrder?: 'nome' | 'data';
  onSortChange?: (sortOrder: 'nome' | 'data') => void;
}

export const TableHeaderComponent = ({ 
  isMobile = false,
  sortOrder = 'data',
  onSortChange
}: TableHeaderComponentProps) => {
  const handleSortChange = (field: 'nome' | 'data') => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  return (
    <TableHeader>
      <TableRow>
        {!isMobile && (
          <TableHead 
            onClick={() => handleSortChange('data')} 
            className={onSortChange ? "cursor-pointer" : ""}
          >
            <div className="flex items-center">
              Data de Cadastro
              {onSortChange && <ArrowUpDown className="ml-1 h-4 w-4" />}
              {sortOrder === 'data' && <span className="ml-1">•</span>}
            </div>
          </TableHead>
        )}
        <TableHead 
          onClick={() => handleSortChange('nome')} 
          className={onSortChange ? "cursor-pointer" : ""}
        >
          <div className="flex items-center">
            Nome
            {onSortChange && <ArrowUpDown className="ml-1 h-4 w-4" />}
            {sortOrder === 'nome' && <span className="ml-1">•</span>}
          </div>
        </TableHead>
        <TableHead>Dia de Venc.</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Pagamento</TableHead>
      </TableRow>
    </TableHeader>
  );
};
