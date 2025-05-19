
import React from "react";
import { SelectField } from "@/components/form/SelectField";
import { InputField } from "@/components/form/InputField";
import { ValoresPredefinidos } from "@/types";

interface MainScreenProps {
  control: any;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const CadastrarClienteMainScreen: React.FC<MainScreenProps> = ({
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
          name="dispositivo_smart"
          control={control}
          label="Dispositivo Smart"
          placeholder="Selecione o dispositivo"
          options={dispositivoOptions}
          disabled={disabled}
        />

        <SelectField
          name="aplicativo"
          control={control}
          label="Aplicativo"
          placeholder="Selecione o aplicativo"
          options={aplicativoOptions}
          disabled={disabled}
        />

        <InputField
          name="usuario_aplicativo"
          control={control}
          label="Usuário (MAC)"
          placeholder="Endereço MAC do dispositivo"
          disabled={disabled}
          maxLength={25}
        />

        <InputField
          name="senha_aplicativo"
          control={control}
          label="Senha (Id)"
          placeholder="Identificação do dispositivo"
          type="password"
          disabled={disabled}
          maxLength={25}
        />

        <InputField
          name="data_licenca_aplicativo"
          control={control}
          label="Vencimento da Licença do App"
          placeholder="Data de vencimento"
          type="date"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
