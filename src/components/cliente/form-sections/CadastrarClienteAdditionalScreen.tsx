
import React from "react";
import { SelectField } from "@/components/form/SelectField";
import { InputField } from "@/components/form/InputField";
import { ValoresPredefinidos } from "@/types";

interface AdditionalScreenProps {
  control: any;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const CadastrarClienteAdditionalScreen: React.FC<AdditionalScreenProps> = ({
  control,
  valoresPredefinidos,
  disabled = false,
}) => {
  const dispositivoOptions = (valoresPredefinidos?.dispositivos_smart || []).map(dispositivo => ({
    value: dispositivo,
    label: dispositivo,
  }));

  const aplicativoOptions = (valoresPredefinidos?.aplicativos || []).map(aplicativo => ({
    value: aplicativo,
    label: aplicativo,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SelectField
          name="dispositivo_smart_2"
          control={control}
          label="Dispositivo Smart 2"
          placeholder="Selecione o dispositivo"
          options={dispositivoOptions}
          disabled={disabled}
        />

        <SelectField
          name="aplicativo_2"
          control={control}
          label="Aplicativo 2"
          placeholder="Selecione o aplicativo"
          options={aplicativoOptions}
          disabled={disabled}
        />

        <InputField
          name="usuario_2"
          control={control}
          label="Usuário (MAC) 2"
          placeholder="Endereço MAC do dispositivo 2"
          disabled={disabled}
          maxLength={25}
        />

        <InputField
          name="senha_2"
          control={control}
          label="Senha (Id) 2"
          placeholder="Identificação do dispositivo 2"
          type="password"
          disabled={disabled}
          maxLength={25}
        />

        <InputField
          name="data_licenca_2"
          control={control}
          label="Vencimento da Licença do App 2"
          placeholder="Data de vencimento"
          type="date"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
