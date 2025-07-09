
import React from "react";
import { Calendar } from "lucide-react";
import { Cliente, Pagamento } from "@/types";
import { useDaysCalculation } from "@/hooks/cliente/useDaysCalculation";

interface DueDateInfoProps {
  cliente: Cliente;
  allPayments: Pagamento[];
}

export const DueDateInfo = ({ cliente, allPayments }: DueDateInfoProps) => {
  const daysInfo = useDaysCalculation(cliente, allPayments);
  
  console.log(`DueDateInfo for ${cliente.nome}:`, daysInfo, 'Payments count:', allPayments.length);
  
  // Se não há informação de vencimento, não mostrar nada
  if (daysInfo.type === 'no_info') {
    return null;
  }
  
  const formatDueInfo = () => {
    if (daysInfo.type === 'overdue') {
      return `Venceu há ${daysInfo.days} dia${daysInfo.days !== 1 ? 's' : ''}`;
    } else if (daysInfo.type === 'today') {
      return 'Vence hoje';
    } else {
      return `Vence em ${daysInfo.days} dia${daysInfo.days !== 1 ? 's' : ''}`;
    }
  };

  // Determina a classe de cor baseada no status e dias
  const getColorClass = () => {
    if (daysInfo.type === 'overdue') {
      return "text-red-500 font-bold";
    } else if (daysInfo.type === 'today' || (daysInfo.type === 'upcoming' && daysInfo.days <= 3)) {
      return "text-yellow-500 font-bold";
    }
    return "";
  };

  return (
    <div className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      <span className={getColorClass()}>
        {formatDueInfo()}
      </span>
    </div>
  );
};
