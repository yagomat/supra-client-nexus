
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditClienteActionsProps {
  isSubmitting: boolean;
  isFormValid: boolean;
  onCancel: () => void;
}

export const EditClienteActions: React.FC<EditClienteActionsProps> = ({
  isSubmitting,
  isFormValid,
  onCancel,
}) => {
  return (
    <div className="flex justify-end space-x-4 pt-6 border-t border-border/50">
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
        disabled={isSubmitting || !isFormValid}
        className="flex items-center space-x-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>Salvar Alterações</span>
      </Button>
    </div>
  );
};
