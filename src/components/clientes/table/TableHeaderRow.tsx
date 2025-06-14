
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon } from "lucide-react";

interface TableHeaderRowProps {
  sortOrder: 'nome' | 'data';
  onSortChange: (field: 'nome' | 'data') => void;
}

export const TableHeaderRow = ({ sortOrder, onSortChange }: TableHeaderRowProps) => {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead className="w-32">
          <Button
            variant="ghost"
            className="flex items-center font-medium -ml-2"
            onClick={() => onSortChange('data')}
          >
            <div className="leading-tight">
              <div>Data de</div>
              <div>Cadastro</div>
            </div>
            {sortOrder === 'data' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4 opacity-70" />
            ) : null}
          </Button>
        </TableHead>
        <TableHead>
          <Button
            variant="ghost"
            className="flex items-center font-medium -ml-2"
            onClick={() => onSortChange('nome')}
          >
            Nome
            {sortOrder === 'nome' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4 opacity-70" />
            ) : null}
          </Button>
        </TableHead>
        <TableHead className="font-medium">Telefone</TableHead>
        <TableHead className="font-medium">UF</TableHead>
        <TableHead className="font-medium">Servidor</TableHead>
        <TableHead>
          <div className="leading-tight font-medium">
            <div>Dia de</div>
            <div>Venc.</div>
          </div>
        </TableHead>
        <TableHead className="font-medium">Plano</TableHead>
        <TableHead className="font-medium">Status</TableHead>
        <TableHead className="font-medium">Tela Principal</TableHead>
        <TableHead className="font-medium">Tela Adicional</TableHead>
        <TableHead className="font-medium">Obs.</TableHead>
        <TableHead className="font-medium text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};
