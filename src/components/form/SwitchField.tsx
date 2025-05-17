
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";

interface SwitchFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  name,
  control,
  label,
  description,
  disabled = false,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            {description && (
              <FormDescription className="text-sm text-muted-foreground">
                {description}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value === true || field.value === "ativo"}
              onCheckedChange={(checked) => {
                if (typeof field.value === "boolean") {
                  field.onChange(checked);
                } else {
                  field.onChange(checked ? "ativo" : "inativo");
                }
              }}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
