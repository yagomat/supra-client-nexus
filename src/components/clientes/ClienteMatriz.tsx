
import { Cliente } from "@/types";
import { PaymentMatrix } from "./matriz/PaymentMatrix";
import { usePaymentMatrixStatus } from "@/hooks/clientes/usePaymentMatrixStatus";
import { usePaymentMatrixPagination } from "@/hooks/clientes/usePaymentMatrixPagination";

interface MesData {
  value: number;
  label: string;
}

interface ClienteMatrizProps {
  clientes: Cliente[];
  meses: MesData[];
  anoAtual: number;
  isMobile?: boolean;
}

export const ClienteMatriz = ({ 
  clientes, 
  meses, 
  anoAtual, 
  isMobile = false
}: ClienteMatrizProps) => {
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedClientes,
    handleItemsPerPageChange
  } = usePaymentMatrixPagination(clientes);

  const {
    getStatusForClient,
    handlePaymentStatusChange
  } = usePaymentMatrixStatus(clientes, anoAtual);

  return (
    <PaymentMatrix
      paginatedClientes={paginatedClientes}
      meses={meses}
      anoAtual={anoAtual}
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      isMobile={isMobile}
      getStatusForClient={getStatusForClient}
      onPaymentStatusChange={handlePaymentStatusChange}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );
};
