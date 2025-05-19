
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
  maxLength?: number;
  pattern?: string;
  isPhoneNumber?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  disabled = false,
  maxLength,
  pattern,
  isPhoneNumber = false,
}) => {
  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
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
                value={isPhoneNumber ? formatPhoneNumber(field.value || '') : (field.value || "")} 
                onChange={(e) => {
                  if (isPhoneNumber) {
                    // For phone numbers, only allow digits and limit to 11 characters
                    const digits = e.target.value.replace(/\D/g, '');
                    if (digits.length <= 11) {
                      field.onChange(digits);
                    }
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
                disabled={disabled}
                maxLength={maxLength}
                pattern={pattern}
              />
              {maxLength && (
                <div className="text-xs text-gray-500 text-right mt-0.5">
                  {field.value?.length || 0}/{maxLength}
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
