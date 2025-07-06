
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ClienteOrderType = 'data' | 'vencimento' | 'nome_asc' | 'nome_desc';

interface ClienteOrderSelectorProps {
  orderBy: ClienteOrderType;
  onOrderChange: (order: ClienteOrderType) => void;
}

export const ClienteOrderSelector = ({ orderBy, onOrderChange }: ClienteOrderSelectorProps) => {
  const orderOptions = [
    { value: 'data' as ClienteOrderType, label: 'Data' },
    { value: 'vencimento' as ClienteOrderType, label: 'Vencimento' },
    { value: 'nome_asc' as ClienteOrderType, label: 'Nome A-Z' },
    { value: 'nome_desc' as ClienteOrderType, label: 'Nome Z-A' },
  ];

  return (
    <Select value={orderBy} onValueChange={onOrderChange}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {orderOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
