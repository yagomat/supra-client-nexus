
import { Table, TableBody } from "@/components/ui/table";
import { PaymentMatrixHeader } from "./PaymentMatrixHeader";
import { PaymentMatrixRow } from "./PaymentMatrixRow";
import { PaymentMatrixPagination } from "./PaymentMatrixPagination";
import { Cliente } from "@/types";

interface MesData {
  value: number;
  label: string;
}

interface PaymentMatrixProps {
  paginatedClientes: Cliente[];
  meses: MesData[];
  anoAtual: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  isMobile?: boolean;
  getStatusForClient: (clienteId: string, mes: number) => string;
  onPaymentStatusChange: (cliente: Cliente, mes: number, status: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const PaymentMatrix = ({
  paginatedClientes,
  meses,
  anoAtual,
  currentPage,
  totalPages,
  itemsPerPage,
  isMobile = false,
  getStatusForClient,
  onPaymentStatusChange,
  onPageChange,
  onItemsPerPageChange
}: PaymentMatrixProps) => {
  return (
    <div className="w-full bg-background rounded-lg shadow-sm border border-border/50 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <div className="min-w-fit">
          <Table>
            <PaymentMatrixHeader meses={meses} isMobile={isMobile} />
            <TableBody>
              {paginatedClientes.map((cliente, index) => (
                <PaymentMatrixRow
                  key={cliente.id}
                  cliente={cliente}
                  index={index}
                  meses={meses}
                  anoAtual={anoAtual}
                  getStatusForClient={getStatusForClient}
                  onPaymentStatusChange={onPaymentStatusChange}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <PaymentMatrixPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
  );
};
