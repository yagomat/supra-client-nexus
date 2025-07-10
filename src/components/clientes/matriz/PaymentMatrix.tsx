
import { Table, TableBody } from "@/components/ui/table";
import { PaymentMatrixHeader } from "./PaymentMatrixHeader";
import { PaymentMatrixRow } from "./PaymentMatrixRow";
import { PaymentMatrixPagination } from "./PaymentMatrixPagination";
import { PaymentStatusButton } from "@/components/pagamentos/PaymentStatusButton";
import { ClienteStatusBadge } from "../ClienteStatusBadge";
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
      <div className="flex">
        {/* Coluna fixa - Nome */}
        <div className="flex-shrink-0 bg-background border-r-2 border-border">
          <Table>
            <thead>
              <tr className="bg-muted/50">
                <th className="font-medium text-left p-3 border-b min-w-[200px] max-w-[200px]">
                  Nome
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClientes.map((cliente, index) => {
                const isOdd = index % 2 === 1;
                const rowBgClass = isOdd ? "bg-muted/10" : "bg-background";
                
                return (
                  <tr key={`name-${cliente.id}`} className={rowBgClass}>
                    <td className="font-medium p-3 border-b min-w-[200px] max-w-[200px] truncate">
                      <div className="truncate" title={cliente.nome}>
                        {cliente.nome}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* Colunas que rolam */}
        <div className="flex-1 overflow-x-auto">
          <Table>
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 border-b">
                  <div className="leading-tight font-medium">
                    <div>Dia de</div>
                    <div>Venc.</div>
                  </div>
                </th>
                <th className="font-medium p-3 border-b">Status</th>
                {meses.map((mes) => (
                  <th key={mes.value} className="text-center font-medium p-3 border-b">
                    {isMobile ? mes.label.substring(0, 3) : mes.label.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedClientes.map((cliente, index) => {
                const isOdd = index % 2 === 1;
                const rowBgClass = isOdd ? "bg-muted/10" : "bg-background";
                
                return (
                  <tr key={`data-${cliente.id}`} className={rowBgClass}>
                    <td className="p-3 border-b">{cliente.dia_vencimento}</td>
                    <td className="p-3 border-b">
                      <ClienteStatusBadge status={cliente.status || 'inativo'} />
                    </td>
                    {meses.map((mes) => {
                      const status = getStatusForClient(cliente.id, mes.value);
                      
                      return (
                        <td key={mes.value} className="p-3 border-b">
                          <div className="flex justify-center">
                            <PaymentStatusButton
                              status={status}
                              onStatusChange={(newStatus) => 
                                onPaymentStatusChange(cliente, mes.value, newStatus)
                              }
                              minimal={true}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
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
