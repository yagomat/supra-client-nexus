
import { Table, TableBody } from "@/components/ui/table";
import { Cliente } from "@/types";
import { TablePagination } from "../table/TablePagination";
import { TableHeaderRow } from "./table/TableHeaderRow";
import { ClienteTableRow } from "./table/ClienteTableRow";

interface ClienteTableProps {
  clientes: Cliente[];
  verDetalhes: (cliente: Cliente) => void;
  verTelaAdicional: (cliente: Cliente) => void;
  verObservacoes: (cliente: Cliente) => void;
  confirmarExclusao: (clienteId: string) => void;
  sortOrder?: 'nome' | 'data';
  onSortChange?: (sortOrder: 'nome' | 'data') => void;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export const ClienteTable = ({
  clientes,
  verDetalhes,
  verTelaAdicional,
  verObservacoes,
  confirmarExclusao,
  sortOrder = 'data',
  onSortChange,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange
}: ClienteTableProps) => {
  const handleSortChange = (field: 'nome' | 'data') => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="rounded-lg shadow-sm overflow-hidden border border-border/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderRow 
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
          <TableBody>
            {paginatedClientes.map((cliente, index) => (
              <ClienteTableRow
                key={cliente.id}
                cliente={cliente}
                index={index}
                verDetalhes={verDetalhes}
                verTelaAdicional={verTelaAdicional}
                verObservacoes={verObservacoes}
                confirmarExclusao={confirmarExclusao}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Componente de paginação */}
      {onPageChange && onItemsPerPageChange && (
        <div className="border-t p-2 bg-muted/10">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};
