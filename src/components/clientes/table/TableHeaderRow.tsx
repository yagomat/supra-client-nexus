
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderRowProps {
  sortOrder?: 'data' | 'nome';
  onSortChange?: (field: 'data' | 'nome') => void;
}

export const TableHeaderRow = ({ sortOrder, onSortChange }: TableHeaderRowProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Data Cadastro</TableHead>
        <TableHead className="sticky left-0 bg-background z-30 border-r-2 border-border shadow-xl">Nome</TableHead>
        <TableHead>Telefone</TableHead>
        <TableHead>UF</TableHead>
        <TableHead>Servidor</TableHead>
        <TableHead>Dia Vencimento</TableHead>
        <TableHead>Valor Plano</TableHead>
        <TableHead>Status Pagamento</TableHead>
        <TableHead>Status Licenças</TableHead>
        <TableHead>Detalhes</TableHead>
        <TableHead>Tela Adicional</TableHead>
        <TableHead>Observações</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};
