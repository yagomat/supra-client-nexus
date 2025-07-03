import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentStatusButton } from "@/components/pagamentos/PaymentStatusButton";
import { Cliente } from "@/types";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { TablePagination } from "../table/TablePagination";
import { usePaymentStatus } from "@/hooks/payments/usePaymentStatus";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { handleChangeStatus } = usePaymentStatus();
  const [pagamentosStatus, setPagamentosStatus] = useState<Record<string, string>>({});
  
  // Mostrar todos os meses, não limitar no mobile
  const displayMeses = meses;
  
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
    setCurrentPage(1);
  };

  // Buscar status de pagamentos para todos os clientes e meses
  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        const { data, error } = await supabase
          .from('pagamentos')
          .select('cliente_id, mes, ano, status')
          .eq('ano', anoAtual)
          .in('cliente_id', clientes.map(c => c.id));

        if (error) {
          console.error("Erro ao buscar pagamentos:", error);
          return;
        }

        const statusMap: Record<string, string> = {};
        data?.forEach(pagamento => {
          const key = `${pagamento.cliente_id}-${pagamento.mes}-${pagamento.ano}`;
          statusMap[key] = pagamento.status;
        });
        
        setPagamentosStatus(statusMap);
      } catch (error) {
        console.error("Erro ao buscar pagamentos:", error);
      }
    };

    if (clientes.length > 0) {
      fetchPagamentos();
    }
  }, [clientes, anoAtual]);

  // Configurar realtime para pagamentos
  useEffect(() => {
    const channel = supabase
      .channel('pagamentos-matriz-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
        }, 
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (newRecord && 
                typeof newRecord.cliente_id === 'string' &&
                typeof newRecord.mes === 'number' &&
                typeof newRecord.ano === 'number' &&
                typeof newRecord.status === 'string' &&
                newRecord.ano === anoAtual) {
              
              const key = `${newRecord.cliente_id}-${newRecord.mes}-${newRecord.ano}`;
              setPagamentosStatus(prev => ({
                ...prev,
                [key]: newRecord.status
              }));
            }
          } else if (payload.eventType === 'DELETE') {
            if (oldRecord &&
                typeof oldRecord.cliente_id === 'string' &&
                typeof oldRecord.mes === 'number' &&
                typeof oldRecord.ano === 'number' &&
                oldRecord.ano === anoAtual) {
              
              const key = `${oldRecord.cliente_id}-${oldRecord.mes}-${oldRecord.ano}`;
              setPagamentosStatus(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [anoAtual]);

  const handlePaymentStatusChange = async (cliente: Cliente, mes: number, status: string) => {
    try {
      const clienteComPagamentos = {
        ...cliente,
        pagamentos: {}
      };
      
      await handleChangeStatus(
        clienteComPagamentos,
        mes,
        anoAtual,
        status
      );
    } catch (error) {
      console.error("Erro ao alterar status de pagamento:", error);
    }
  };

  const getStatusForClient = (clienteId: string, mes: number): string => {
    const key = `${clienteId}-${mes}-${anoAtual}`;
    return pagamentosStatus[key] || "nao_pago";
  };
  
  return (
    <div className="rounded-lg shadow-sm overflow-hidden border border-border/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium sticky left-0 bg-muted/50 z-30 border-r-2 border-border shadow-xl">Nome</TableHead>
              <TableHead>
                <div className="leading-tight font-medium">
                  <div>Dia de</div>
                  <div>Venc.</div>
                </div>
              </TableHead>
              <TableHead className="font-medium">Status</TableHead>
              {displayMeses.map((mes) => (
                <TableHead key={mes.value} className="text-center font-medium">
                  {isMobile ? mes.label.substring(0, 3) : mes.label.substring(0, 3)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.map((cliente, index) => {
              const isOdd = index % 2 === 1;
              const rowBgClass = isOdd ? "bg-muted/10" : "bg-background";
              const nameCellBgClass = isOdd ? "bg-muted" : "bg-background";
              
              return (
                <TableRow key={cliente.id} className={rowBgClass}>
                  <TableCell className={`font-medium sticky left-0 ${nameCellBgClass} z-30 border-r-2 border-border shadow-xl`}>
                    {cliente.nome}
                  </TableCell>
                  <TableCell>{cliente.dia_vencimento}</TableCell>
                  <TableCell>
                    <ClienteStatusBadge status={cliente.status || 'inativo'} />
                  </TableCell>
                  {displayMeses.map((mes) => {
                    const status = getStatusForClient(cliente.id, mes.value);
                    
                    return (
                      <TableCell key={mes.value}>
                        <div className="flex justify-center">
                          <PaymentStatusButton
                            status={status}
                            onStatusChange={(newStatus) => 
                              handlePaymentStatusChange(cliente, mes.value, newStatus)
                            }
                            minimal={true}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
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
