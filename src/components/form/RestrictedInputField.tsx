
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

interface RestrictedInputFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  maxLength?: number;
  allowOnlyLowercaseAndNumbers?: boolean;
}

export const RestrictedInputField: React.FC<RestrictedInputFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  disabled = false,
  maxLength,
  allowOnlyLowercaseAndNumbers = false,
}) => {
  // Função para sanitizar entrada permitindo apenas letras minúsculas e números
  const sanitizeInput = (value: string) => {
    if (!allowOnlyLowercaseAndNumbers) return value;
    
    // Remove tudo que não seja letra minúscula ou número
    return value.replace(/[^a-z0-9]/g, '').toLowerCase();
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div>
              <Input 
                type={type} 
                placeholder={placeholder} 
                {...field} 
                value={field.value || ""} 
                onChange={(e) => {
                  const sanitizedValue = sanitizeInput(e.target.value);
                  field.onChange(sanitizedValue);
                }}
                disabled={disabled}
                maxLength={maxLength}
                readOnly={false}
              />
              {maxLength && (
                <div className="text-xs text-gray-500 text-right mt-0.5">
                  {field.value?.length || 0}/{maxLength}
                </div>
              )}
              {allowOnlyLowercaseAndNumbers && (
                <div className="text-xs text-muted-foreground mt-1">
                  Apenas letras minúsculas e números são permitidos
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
