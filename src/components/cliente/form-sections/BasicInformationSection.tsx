
import React from "react";
import { Control } from "react-hook-form";
import { SelectField } from "@/components/form/SelectField";
import { InputField } from "@/components/form/InputField";
import { SwitchField } from "@/components/form/SwitchField";
import { ValoresPredefinidos } from "@/types";

interface BasicInformationSectionProps {
  control: Control<any>;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  control,
  valoresPredefinidos,
  disabled = false,
}) => {
  return (
    <div className="border p-4 rounded-md space-y-4">
      <h2 className="text-xl font-semibold">Informações Básicas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="nome"
          control={control}
          label="Nome"
          placeholder="Nome do cliente"
          disabled={disabled}
        />

        <InputField
          name="telefone"
          control={control}
          label="Telefone"
          placeholder="(00) 00000-0000"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {valoresPredefinidos?.ufs && (
          <SelectField
            name="uf"
            control={control}
            label="UF"
            placeholder="Selecione um estado"
            options={[
              { value: "nao_informado", label: "Não informado" },
              ...valoresPredefinidos.ufs.map(uf => ({ value: uf, label: uf }))
            ]}
            disabled={disabled}
          />
        )}

        {valoresPredefinidos?.servidores && (
          <SelectField
            name="servidor"
            control={control}
            label="Servidor"
            placeholder="Selecione um servidor"
            options={valoresPredefinidos.servidores.map(servidor => ({
              value: servidor,
              label: servidor
            }))}
            disabled={disabled}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {valoresPredefinidos?.dias_vencimento && (
          <SelectField
            name="dia_vencimento"
            control={control}
            label="Dia de Vencimento"
            placeholder="Selecione o dia"
            options={valoresPredefinidos.dias_vencimento.map(dia => ({
              value: dia.toString(),
              label: dia.toString()
            }))}
            disabled={disabled}
          />
        )}

        {valoresPredefinidos?.valores_plano && (
          <SelectField
            name="valor_plano"
            control={control}
            label="Valor do Plano (R$)"
            placeholder="Selecione o valor"
            options={[
              { value: "nao_informado", label: "Não informado" },
              ...valoresPredefinidos.valores_plano.map(valor => ({
                value: valor.toString(),
                label: `R$ ${valor.toFixed(2).replace('.', ',')}`
              }))
            ]}
            disabled={disabled}
          />
        )}
      </div>

      <SwitchField
        name="status"
        control={control}
        label="Status do Cliente"
        description="Cliente está ativo ou inativo no sistema"
        disabled={disabled}
      />
    </div>
  );
};
