
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/form/SelectField";
import { RestrictedInputField } from "@/components/form/RestrictedInputField";
import { Control } from "react-hook-form";
import { ClienteFormValues } from "@/hooks/cliente";
import { ValoresPredefinidos } from "@/types";

interface CadastrarClienteAdditionalScreenProps {
  control: Control<ClienteFormValues>;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const CadastrarClienteAdditionalScreen = ({ 
  control, 
  valoresPredefinidos, 
  disabled = false 
}: CadastrarClienteAdditionalScreenProps) => {
  return (
    <div className="space-y-4">
      {valoresPredefinidos?.dispositivos_smart && (
        <SelectField
          name="dispositivo_smart_2"
          control={control}
          label="Dispositivo Smart 2"
          placeholder="Selecione um dispositivo"
          options={valoresPredefinidos.dispositivos_smart.map(dispositivo => ({
            value: dispositivo,
            label: dispositivo
          }))}
          disabled={disabled}
        />
      )}

      {valoresPredefinidos?.aplicativos && (
        <SelectField
          name="aplicativo_2"
          control={control}
          label="Aplicativo 2"
          placeholder="Selecione um aplicativo"
          options={valoresPredefinidos.aplicativos.map(app => ({
            value: app,
            label: app
          }))}
          disabled={disabled}
        />
      )}

      <RestrictedInputField
        name="usuario_2"
        control={control}
        label="Usuário 2"
        placeholder="Digite o usuário"
        disabled={disabled}
        maxLength={25}
      />

      <RestrictedInputField
        name="senha_2"
        control={control}
        label="Senha 2"
        placeholder="Digite a senha"
        type="password"
        disabled={disabled}
        maxLength={25}
      />

      <FormField
        control={control}
        name="data_licenca_2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Licença 2</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
