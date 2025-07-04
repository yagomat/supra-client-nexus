
import React from "react";
import { Calendar } from "lucide-react";
import { Cliente } from "@/types";
import { useDaysCalculation } from "@/hooks/cliente/useDaysCalculation";

interface DueDateInfoProps {
  cliente: Cliente;
}

export const DueDateInfo = ({ cliente }: DueDateInfoProps) => {
  const daysInfo = useDaysCalculation(cliente);
  
  const formatDueInfo = () => {
    if (daysInfo.type === 'overdue') {
      return `Venceu há ${daysInfo.days} dia${daysInfo.days !== 1 ? 's' : ''}`;
    } else if (daysInfo.type === 'today') {
      return 'Vence hoje';
    } else {
      return `Vence em ${daysInfo.days} dia${daysInfo.days !== 1 ? 's' : ''}`;
    }
  };

  // Determina se deve aplicar formatação em vermelho e negrito
  const shouldHighlight = () => {
    return (daysInfo.type === 'upcoming' && daysInfo.days <= 3) || 
           daysInfo.type === 'today' || 
           daysInfo.type === 'overdue';
  };

  return (
    <div className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      <span className={shouldHighlight() ? "text-red-500 font-bold" : ""}>
        {formatDueInfo()}
      </span>
    </div>
  );
};
