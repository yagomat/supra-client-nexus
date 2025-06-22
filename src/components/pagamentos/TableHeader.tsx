
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderProps {
  isMobile?: boolean;
}

export const TableHeader = ({ isMobile = false }: TableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Data Cadastro</TableHead>
        <TableHead className="sticky left-0 bg-background z-30 border-r-2 border-border shadow-xl">Nome</TableHead>
        <TableHead>Dia Vencimento</TableHead>
        {!isMobile && <TableHead>Valor Plano</TableHead>}
        <TableHead>Status Pagamento</TableHead>
        <TableHead>Status Licenças</TableHead>
        <TableHead>Pagamento</TableHead>
      </TableRow>
    </TableHeader>
  );
};
