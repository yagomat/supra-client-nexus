
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentStatusOptions } from "./PaymentStatusBadge";

interface PaymentStatusSelectProps {
  status: string | undefined;
  onStatusChange: (value: string) => void;
  disabled?: boolean;
  width?: string;
  minimal?: boolean;
}

export const PaymentStatusSelect = ({ 
  status, 
  onStatusChange, 
  disabled = false,
  width = "w-[140px]",
  minimal = false
}: PaymentStatusSelectProps) => {
  return (
    <Select
      onValueChange={onStatusChange}
      value={status}
      disabled={disabled}
    >
      <SelectTrigger className={width}>
        <SelectValue placeholder={minimal ? "Status" : "Alterar status"} />
      </SelectTrigger>
      <SelectContent>
        {paymentStatusOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={option.className}
          >
            {minimal ? option.label.substring(0, 5) + "..." : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
