
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemsPerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export const ItemsPerPageSelector = ({
  value,
  onChange,
  options = [10, 20, 50, 100],
}: ItemsPerPageSelectorProps) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <span>Itens por página:</span>
      <Select
        value={value.toString()}
        onValueChange={(value) => onChange(parseInt(value))}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder={value} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
