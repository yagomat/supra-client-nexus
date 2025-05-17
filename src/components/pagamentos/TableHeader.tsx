
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderComponentProps {
  isMobile?: boolean;
}

export const TableHeaderComponent = ({ isMobile = false }: TableHeaderComponentProps) => {
  return (
    <TableHeader>
      <TableRow>
        {!isMobile && <TableHead>Data de Cadastro</TableHead>}
        <TableHead>Nome</TableHead>
        <TableHead>Dia de Venc.</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Pagamento</TableHead>
      </TableRow>
    </TableHeader>
  );
};
