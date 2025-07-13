
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
import { AlertTriangle } from "lucide-react";

interface RestrictedInputFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const RestrictedInputField: React.FC<RestrictedInputFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  disabled = false,
  maxLength,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const hasDecryptionError = field.value && field.value.includes('[ERRO_DESCRIPTOGRAFIA]');
        const isStillEncrypted = field.value && field.value.length > 50 && /^[a-f0-9]+$/i.test(field.value);
        const hasError = hasDecryptionError || isStillEncrypted;
        
        return (
          <FormItem>
            <FormLabel className={hasError ? "text-orange-500" : ""}>
              {label}
              {hasError && (
                <span className="ml-2 inline-flex items-center text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {hasDecryptionError ? "Erro na descriptografia" : "Dados criptografados"}
                </span>
              )}
            </FormLabel>
            <FormControl>
              <div>
                <Input 
                  type={type} 
                  placeholder={hasError ? "Digite novamente o valor" : placeholder}
                  {...field} 
                  value={hasError ? "" : (field.value || "")}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  disabled={disabled}
                  maxLength={maxLength}
                  className={hasError ? "border-orange-500 focus:border-orange-600" : ""}
                />
                {maxLength && !hasError && (
                  <div className="text-xs text-gray-500 text-right mt-0.5">
                    {field.value?.length || 0}/{maxLength}
                  </div>
                )}
                {hasError && (
                  <div className="text-xs text-orange-600 mt-1">
                    {hasDecryptionError 
                      ? "Os dados não puderam ser descriptografados. Digite novamente o valor para atualizá-lo."
                      : "Os dados estão criptografados. Digite novamente o valor para descriptografá-los."
                    }
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
