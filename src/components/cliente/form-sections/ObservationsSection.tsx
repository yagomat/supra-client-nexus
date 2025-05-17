
import React from "react";
import { Control } from "react-hook-form";
import { TextareaField } from "@/components/form/TextareaField";

interface ObservationsSectionProps {
  control: Control<any>;
  disabled?: boolean;
}

export const ObservationsSection: React.FC<ObservationsSectionProps> = ({
  control,
  disabled = false,
}) => {
  return (
    <div className="border p-4 rounded-md space-y-4">
      <h2 className="text-xl font-semibold">Observações</h2>

      <TextareaField
        name="observacoes"
        control={control}
        label="Observações"
        placeholder="Observações sobre o cliente"
        className="min-h-[100px]"
        disabled={disabled}
      />
    </div>
  );
};
