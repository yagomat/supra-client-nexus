
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CodigoPaisSelect } from "@/components/form/CodigoPaisSelect";
import { SelectField } from "@/components/form/SelectField";
import { Control } from "react-hook-form";
import { ClienteFormValues } from "@/hooks/cliente";
import { ValoresPredefinidos } from "@/types";

interface CadastrarClienteBasicInformationProps {
  control: Control<ClienteFormValues>;
  valoresPredefinidos: ValoresPredefinidos | null;
  disabled?: boolean;
}

export const CadastrarClienteBasicInformation = ({ 
  control, 
  valoresPredefinidos, 
  disabled = false 
}: CadastrarClienteBasicInformationProps) => {
  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do cliente" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="codigo_pais_telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código do País</FormLabel>
              <FormControl>
                <CodigoPaisSelect
                  value={field.value || "+55"}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="telefone"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <div>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    value={formatPhoneNumber(field.value || '')} 
                    onChange={(e) => {
                      // For phone numbers, only allow digits and limit to 11 characters
                      const digits = e.target.value.replace(/\D/g, '');
                      if (digits.length <= 11) {
                        field.onChange(digits);
                      }
                    }}
                    disabled={disabled}
                  />
                  <div className="text-xs text-gray-500 text-right mt-0.5">
                    {(field.value?.length || 0)}/11
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {valoresPredefinidos?.ufs && (
          <SelectField
            name="uf"
            control={control}
            label="UF"
            placeholder="Selecione um estado"
            options={valoresPredefinidos.ufs.map(uf => ({ value: uf, label: uf }))}
            disabled={disabled}
          />
        )}

        {valoresPredefinidos?.servidores && (
          <SelectField
            name="servidor"
            control={control}
            label="Servidor *"
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
            label="Dia de Vencimento *"
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
            options={valoresPredefinidos.valores_plano.map(valor => ({
              value: valor.toString(),
              label: `R$ ${valor.toFixed(2).replace('.', ',')}`
            }))}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
