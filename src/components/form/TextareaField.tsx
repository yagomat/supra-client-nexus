
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

interface TextareaFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  className,
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
            <Textarea
              placeholder={placeholder}
              className={className}
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
