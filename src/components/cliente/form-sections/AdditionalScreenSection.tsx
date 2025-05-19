
import React from "react";
import { Control, useWatch } from "react-hook-form";
import { SelectField } from "@/components/form/SelectField";
import { InputField } from "@/components/form/InputField";
import { SwitchField } from "@/components/form/SwitchField";
import { ValoresPredefinidos } from "@/types";

interface AdditionalScreenSectionProps {
  control: Control<any>;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const AdditionalScreenSection: React.FC<AdditionalScreenSectionProps> = ({
  control,
  valoresPredefinidos,
  disabled = false,
}) => {
  const possuiTelaAdicional = useWatch({
    control,
    name: "possui_tela_adicional",
    defaultValue: false,
  });

  return (
    <div className="border p-4 rounded-md space-y-4">
      <SwitchField
        name="possui_tela_adicional"
        control={control}
        label="Tela Adicional"
        description="Cliente possui uma tela adicional"
        disabled={disabled}
      />

      {possuiTelaAdicional && (
        <div className="space-y-4 pt-2">
          {valoresPredefinidos?.dispositivos_smart && (
            <SelectField
              name="dispositivo_smart_2"
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
                name="aplicativo_2"
                control={control}
                label="Aplicativo"
                placeholder="Selecione um aplicativo"
                options={[
                  { value: "nao_informado", label: "Não informado" },
                  ...valoresPredefinidos.aplicativos.map(app => ({
                    value: app,
                    label: app
                  }))
                ]}
                disabled={disabled}
              />
            )}

            <InputField
              name="data_licenca_2"
              control={control}
              label="Vencimento da Licença do App 2"
              placeholder="Data de vencimento"
              type="date"
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="usuario_2"
              control={control}
              label="Usuário (MAC) 2"
              placeholder="Endereço MAC do dispositivo"
              disabled={disabled}
              maxLength={50}
            />

            <InputField
              name="senha_2"
              control={control}
              label="Senha (Id) 2"
              placeholder="Identificação do dispositivo"
              disabled={disabled}
              maxLength={50}
            />
          </div>
        </div>
      )}
    </div>
  );
};
