
import { Switch } from "@/components/ui/switch";

interface CadastrarClienteTelaAdicionalToggleProps {
  possuiTelaAdicional: boolean;
  setPossuiTelaAdicional: (value: boolean) => void;
  isSubmitting: boolean;
}

export const CadastrarClienteTelaAdicionalToggle = ({ 
  possuiTelaAdicional, 
  setPossuiTelaAdicional, 
  isSubmitting 
}: CadastrarClienteTelaAdicionalToggleProps) => {
  return (
    <div className="flex items-center space-x-3 p-4 border rounded-lg">
      <Switch
        id="possuiTelaAdicional"
        checked={possuiTelaAdicional}
        onCheckedChange={setPossuiTelaAdicional}
        disabled={isSubmitting}
      />
      <label
        htmlFor="possuiTelaAdicional"
        className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Acrescentar uma tela adicional
      </label>
    </div>
  );
};
