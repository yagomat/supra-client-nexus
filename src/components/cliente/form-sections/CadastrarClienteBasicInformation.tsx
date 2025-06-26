
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CodigoPaisSelect } from "@/components/form/CodigoPaisSelect";
import { Control } from "react-hook-form";
import { ClienteFormValues } from "@/hooks/cliente";

interface CadastrarClienteBasicInformationProps {
  control: Control<ClienteFormValues>;
}

export const CadastrarClienteBasicInformation = ({ control }: CadastrarClienteBasicInformationProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informações Básicas</h3>
      
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do cliente" {...field} />
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
                <Input placeholder="11999999999" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="uf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>UF</FormLabel>
            <FormControl>
              <Input placeholder="SP" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
