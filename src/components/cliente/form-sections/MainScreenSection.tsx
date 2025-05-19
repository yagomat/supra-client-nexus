
import React from "react";
import { Control } from "react-hook-form";
import { SelectField } from "@/components/form/SelectField";
import { InputField } from "@/components/form/InputField";
import { ValoresPredefinidos } from "@/types";

interface MainScreenSectionProps {
  control: Control<any>;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const MainScreenSection: React.FC<MainScreenSectionProps> = ({
  control,
  valoresPredefinidos,
  disabled = false,
}) => {
  return (
    <div className="border p-4 rounded-md space-y-4">
      <h2 className="text-xl font-semibold">Tela Principal</h2>

      {valoresPredefinidos?.dispositivos_smart && (
        <SelectField
          name="dispositivo_smart"
          control={control}
          label="Dispositivo"
          placeholder="Selecione um dispositivo"
          options={[
            { value: "nao_informado", label: "Não informado" },
            ...valoresPredefinidos.dispositivos_smart.map(dispositivo => ({
              value: dispositivo,
              label: dispositivo
            }))
          ]}
          disabled={disabled}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {valoresPredefinidos?.aplicativos && (
          <SelectField
            name="aplicativo"
            control={control}
            label="Aplicativo"
            placeholder="Selecione um aplicativo"
            options={valoresPredefinidos.aplicativos.map(app => ({
              value: app,
              label: app
            }))}
            disabled={disabled}
          />
        )}

        <InputField
          name="data_licenca_aplicativo"
          control={control}
          label="Vencimento da Licença do App"
          placeholder="Data de vencimento"
          type="date"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="usuario_aplicativo"
          control={control}
          label="Usuário (MAC)"
          placeholder="Endereço MAC do dispositivo"
          disabled={disabled}
          maxLength={50}
        />

        <InputField
          name="senha_aplicativo"
          control={control}
          label="Senha (Id)"
          placeholder="Identificação do dispositivo"
          disabled={disabled}
          maxLength={50}
        />
      </div>
    </div>
  );
};
