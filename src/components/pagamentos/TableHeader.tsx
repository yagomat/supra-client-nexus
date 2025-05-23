
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
          <TableHead className="fixed-column-1 min-w-[130px]">
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
        <TableHead className={isMobile ? "min-w-[160px]" : "fixed-column-2 min-w-[160px]"}>
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
        <TableHead className="min-w-[80px]">
          <div className="leading-tight">
            <div>Dia de</div>
            <div>Venc.</div>
          </div>
        </TableHead>
        {!isMobile && <TableHead className="min-w-[100px]">Plano</TableHead>}
        <TableHead className="min-w-[100px]">Status</TableHead>
        <TableHead className="min-w-[150px]">Pagamento</TableHead>
      </TableRow>
    </TableHeader>
  );
};
