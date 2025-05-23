
import { useState } from "react";
import { TableBody } from "@/components/ui/table";
import { ClienteComPagamentos } from "@/types";
import { ClienteRow } from "./ClienteRow";
import { TableHeaderComponent } from "./TableHeader";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Paginação
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClientes = clientes.slice(startIndex, startIndex + pageSize);
  
  // Manipular mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Manipular mudança de tamanho da página
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Voltar para a primeira página ao mudar o tamanho
  };
  
  return (
    <div className="overflow-x-auto">
      <ScrollableTable fixedColumns={2} className={theme === 'dark' ? 'table-dark' : ''}>
        <TableHeaderComponent 
          isMobile={isMobile} 
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
        <TableBody>
          {paginatedClientes.map((cliente) => (
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
      </ScrollableTable>
      
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={clientes.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
