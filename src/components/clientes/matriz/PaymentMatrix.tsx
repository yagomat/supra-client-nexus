
import { Table, TableBody } from "@/components/ui/table";
import { PaymentMatrixHeader } from "./PaymentMatrixHeader";
import { PaymentMatrixRow } from "./PaymentMatrixRow";
import { PaymentMatrixPagination } from "./PaymentMatrixPagination";
import { PaymentStatusButton } from "@/components/pagamentos/PaymentStatusButton";
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
      <div className="flex w-full">
        {/* Tabela fixa com coluna nome */}
        <div className="flex-shrink-0 border-r border-border">
          <Table>
            <thead className="bg-muted/50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground border-b w-32">
                  Nome
                </th>
              </tr>
            </thead>
            <TableBody>
              {paginatedClientes.map((cliente, index) => {
                const isOdd = index % 2 === 1;
                const bgClass = isOdd ? "bg-muted/10" : "bg-background";
                
                return (
                  <tr key={`${cliente.id}-name`} className={`border-b transition-colors hover:bg-muted/50 ${bgClass}`}>
                    <td className="h-16 px-4 align-middle w-32">
                      <div className="font-medium text-sm w-24 leading-tight break-words overflow-hidden" style={{ maxHeight: '2.5rem', lineHeight: '1.25rem' }} title={cliente.nome}>
                        {cliente.nome}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Tabela scrollável com dados de pagamento */}
        <div className="flex-1 overflow-x-auto">
          <Table>
            <thead className="bg-muted/50">
              <tr>
                {meses.map((mes) => (
                  <th 
                    key={mes.value} 
                    className="h-12 px-3 text-center align-middle font-medium text-muted-foreground border-b min-w-[120px]"
                  >
                    <div className="text-xs">
                      <div>{mes.label}</div>
                      <div className="text-xs text-muted-foreground/70">{anoAtual}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <TableBody>
              {paginatedClientes.map((cliente, index) => {
                const isOdd = index % 2 === 1;
                const bgClass = isOdd ? "bg-muted/10" : "bg-background";
                
                return (
                  <tr key={`${cliente.id}-payments`} className={`border-b transition-colors hover:bg-muted/50 ${bgClass}`}>
                    {meses.map((mes) => {
                      const status = getStatusForClient(cliente.id, mes.value);
                      
                      return (
                        <td key={`${cliente.id}-${mes.value}`} className="h-16 px-3 align-middle">
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
