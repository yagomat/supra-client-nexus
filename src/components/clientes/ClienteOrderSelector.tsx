
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownAZ, ArrowUpAZ, Calendar, CalendarClock } from "lucide-react";

export type ClienteOrderType = 'data' | 'vencimento' | 'nome_asc' | 'nome_desc';

interface ClienteOrderSelectorProps {
  orderBy: ClienteOrderType;
  onOrderChange: (order: ClienteOrderType) => void;
}

export const ClienteOrderSelector = ({ orderBy, onOrderChange }: ClienteOrderSelectorProps) => {
  const orderOptions = [
    { value: 'data' as ClienteOrderType, label: 'Data de Cadastro', icon: Calendar },
    { value: 'vencimento' as ClienteOrderType, label: 'Vencimento', icon: CalendarClock },
    { value: 'nome_asc' as ClienteOrderType, label: 'Nome (A-Z)', icon: ArrowDownAZ },
    { value: 'nome_desc' as ClienteOrderType, label: 'Nome (Z-A)', icon: ArrowUpAZ },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Ordenar por:</span>
      <Select value={orderBy} onValueChange={onOrderChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {orderOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
