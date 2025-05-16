
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentStatusOptions } from "./PaymentStatusBadge";

interface PaymentStatusSelectProps {
  status: string | undefined;
  onStatusChange: (value: string) => void;
  disabled?: boolean;
  width?: string;
}

export const PaymentStatusSelect = ({ 
  status, 
  onStatusChange, 
  disabled = false,
  width = "w-[140px]"
}: PaymentStatusSelectProps) => {
  return (
    <Select
      onValueChange={onStatusChange}
      value={status}
      disabled={disabled}
    >
      <SelectTrigger className={width}>
        <SelectValue placeholder="Alterar status" />
      </SelectTrigger>
      <SelectContent>
        {paymentStatusOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={option.className}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
