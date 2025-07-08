
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";

interface CadastrarClienteActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const CadastrarClienteActions = ({ isSubmitting, onCancel }: CadastrarClienteActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 pt-6 border-t">
      <Button
        variant="outline"
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="flex items-center space-x-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        <Shield className="h-4 w-4" />
        <span>Cadastrar Cliente</span>
      </Button>
    </div>
  );
};
