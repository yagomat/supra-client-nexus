
import { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ClienteComPagamentos } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { PaymentStatusCell } from "./PaymentStatusCell";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { supabase } from "@/integrations/supabase/client";

interface ClienteRowProps {
  cliente: ClienteComPagamentos;
  mesAtual: number;
  anoAtual: number;
  submitting: boolean;
  onChangeStatus: (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => void;
  isMobile?: boolean;
}

export const ClienteRow = ({
  cliente,
  mesAtual,
  anoAtual,
  submitting,
  onChangeStatus,
  isMobile = false
}: ClienteRowProps) => {
  const [clienteStatus, setClienteStatus] = useState(cliente.status);

  // Subscribe to changes for this specific client
  useEffect(() => {
    // Enable subscription to the cliente table for this specific client
    const clienteChannel = supabase
      .channel(`cliente-${cliente.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'clientes',
          filter: `id=eq.${cliente.id}`
        }, 
        (payload) => {
          console.log(`Cliente ${cliente.id} status updated:`, payload.new.status);
          setClienteStatus(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clienteChannel);
    };
  }, [cliente.id]);

  // Formatar valor do plano para exibição
  const valorPlanoFormatado = cliente.valor_plano 
    ? `R$ ${cliente.valor_plano.toFixed(2).replace('.', ',')}`
    : "-";

  return (
    <TableRow>
      {!isMobile && <TableCell>{formatDate(cliente.created_at)}</TableCell>}
      <TableCell className="font-medium">{cliente.nome}</TableCell>
      <TableCell>{cliente.dia_vencimento}</TableCell>
      <TableCell>{valorPlanoFormatado}</TableCell>
      <TableCell>
        <ClientStatusBadge status={clienteStatus} />
      </TableCell>
      <TableCell>
        <PaymentStatusCell
          cliente={cliente}
          mesAtual={mesAtual}
          anoAtual={anoAtual}
          submitting={submitting}
          onChangeStatus={onChangeStatus}
          isMobile={isMobile}
        />
      </TableCell>
    </TableRow>
  );
};
