
import { Table, TableBody } from "@/components/ui/table";
import { ClienteComPagamentos } from "@/types";
import { ClienteRow } from "./ClienteRow";
import { TableHeaderComponent } from "./TableHeader";

interface PagamentosTableProps {
  clientes: ClienteComPagamentos[];
  mesAtual: number;
  anoAtual: number;
  submitting: boolean;
  onChangeStatus: (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => void;
  isMobile?: boolean;
  sortOrder?: 'nome' | 'data';
  onSortChange?: (sortOrder: 'nome' | 'data') => void;
}

export const PagamentosTable = ({ 
  clientes, 
  mesAtual, 
  anoAtual, 
  submitting,
  onChangeStatus,
  isMobile = false,
  sortOrder = 'data',
  onSortChange
}: PagamentosTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeaderComponent 
          isMobile={isMobile} 
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
        <TableBody>
          {clientes.map((cliente) => (
            <ClienteRow
              key={cliente.id}
              cliente={cliente}
              mesAtual={mesAtual}
              anoAtual={anoAtual}
              submitting={submitting}
              onChangeStatus={onChangeStatus}
              isMobile={isMobile}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
