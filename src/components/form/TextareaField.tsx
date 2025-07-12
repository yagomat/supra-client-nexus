
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { sanitizeFormInput } from "@/utils/xssSanitizer";

interface TextareaFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  className,
  disabled = false,
  maxLength,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div>
              <Textarea
                placeholder={placeholder}
                className={className}
                {...field}
                value={field.value || ""}
                disabled={disabled}
                maxLength={maxLength}
                onChange={(e) => {
                  // Sanitizar entrada em tempo real
                  const sanitizedValue = sanitizeFormInput(e.target.value);
                  field.onChange(sanitizedValue);
                }}
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
