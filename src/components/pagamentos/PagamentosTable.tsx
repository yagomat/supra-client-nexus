
import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { ClienteComPagamentos } from "@/types";
import { ClienteRow } from "./ClienteRow";
import { TableHeaderComponent } from "./TableHeader";
import { TablePagination } from "../table/TablePagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Manipulador para mudar itens por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Resetar para a primeira página quando mudar itens por página
  };
  
  return (
    <div className="rounded-lg shadow-sm overflow-hidden border border-border/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderComponent 
            isMobile={isMobile} 
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
          <TableBody>
            {paginatedClientes.map((cliente, index) => (
              <ClienteRow
                key={cliente.id}
                cliente={cliente}
                mesAtual={mesAtual}
                anoAtual={anoAtual}
                submitting={submitting}
                onChangeStatus={onChangeStatus}
                isMobile={isMobile}
                isAlternate={index % 2 === 1}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Componente de paginação */}
      <div className="border-t p-2 bg-muted/10">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};
