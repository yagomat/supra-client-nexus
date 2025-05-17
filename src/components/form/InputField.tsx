
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface InputFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  disabled = false,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              type={type} 
              placeholder={placeholder} 
              {...field} 
              value={field.value || ""} 
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
