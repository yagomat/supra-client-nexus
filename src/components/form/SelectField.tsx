
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  options,
  disabled = false,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select 
            onValueChange={(value) => {
              // Se o campo é dia_vencimento, converter para número
              if (name === 'dia_vencimento') {
                field.onChange(parseInt(value));
              } else {
                field.onChange(value);
              }
            }} 
            value={field.value?.toString() || ""} 
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
