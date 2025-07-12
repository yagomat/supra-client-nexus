
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/form/SelectField";
import { RestrictedInputField } from "@/components/form/RestrictedInputField";
import { Control } from "react-hook-form";
import { ClienteFormValues } from "@/hooks/cliente";
import { ValoresPredefinidos } from "@/types";

interface CadastrarClienteMainScreenProps {
  control: Control<ClienteFormValues>;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const CadastrarClienteMainScreen = ({ 
  control, 
  valoresPredefinidos, 
  disabled = false 
}: CadastrarClienteMainScreenProps) => {
  return (
    <div className="space-y-4">
      {valoresPredefinidos?.dispositivos_smart && (
        <SelectField
          name="dispositivo_smart"
          control={control}
          label="Dispositivo Smart"
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
          name="aplicativo"
          control={control}
          label="Aplicativo *"
          placeholder="Selecione um aplicativo"
          options={valoresPredefinidos.aplicativos.map(app => ({
            value: app,
            label: app
          }))}
          disabled={disabled}
        />
      )}

      <RestrictedInputField
        name="usuario_aplicativo"
        control={control}
        label="Usuário do Aplicativo"
        placeholder="Digite o usuário"
        disabled={disabled}
        maxLength={25}
      />

      <RestrictedInputField
        name="senha_aplicativo"
        control={control}
        label="Senha do Aplicativo"
        placeholder="Digite a senha"
        type="password"
        disabled={disabled}
        maxLength={25}
      />

      <FormField
        control={control}
        name="data_licenca_aplicativo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Licença do Aplicativo</FormLabel>
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
