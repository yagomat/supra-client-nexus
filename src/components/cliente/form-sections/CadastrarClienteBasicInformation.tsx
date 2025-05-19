
import React from "react";
import { SelectField } from "@/components/form/SelectField";
import { InputField } from "@/components/form/InputField";
import { ValoresPredefinidos } from "@/types";

interface BasicInformationProps {
  control: any;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const CadastrarClienteBasicInformation: React.FC<BasicInformationProps> = ({
  control,
  valoresPredefinidos,
  disabled = false,
}) => {
  // Convert predefined values to options format
  const ufOptions = (valoresPredefinidos?.ufs || []).map(uf => ({
    value: uf,
    label: uf,
  }));

  const servidorOptions = (valoresPredefinidos?.servidores || []).map(servidor => ({
    value: servidor,
    label: servidor,
  }));

  const diaVencimentoOptions = (valoresPredefinidos?.dias_vencimento || []).map(dia => ({
    value: dia.toString(),
    label: dia.toString(),
  }));

  const valorPlanoOptions = (valoresPredefinidos?.valores_plano || []).map(valor => ({
    value: valor.toString(),
    label: `R$ ${valor.toFixed(2)}`,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InputField
          name="nome"
          control={control}
          label="Nome"
          placeholder="Nome completo do cliente"
          disabled={disabled}
          maxLength={40}
        />

        <InputField
          name="telefone"
          control={control}
          label="Telefone"
          placeholder="(00) 00000-0000"
          disabled={disabled}
          isPhoneNumber={true}
        />

        <SelectField
          name="uf"
          control={control}
          label="UF"
          placeholder="Selecione a UF"
          options={ufOptions}
          disabled={disabled}
        />

        <SelectField
          name="servidor"
          control={control}
          label="Servidor"
          placeholder="Selecione o servidor"
          options={servidorOptions}
          disabled={disabled}
        />

        <SelectField
          name="dia_vencimento"
          control={control}
          label="Dia de Vencimento"
          placeholder="Selecione o dia"
          options={diaVencimentoOptions}
          disabled={disabled}
        />

        <SelectField
          name="valor_plano"
          control={control}
          label="Valor do Plano"
          placeholder="Selecione o valor"
          options={valorPlanoOptions}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
