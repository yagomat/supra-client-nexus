
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PasswordChangeActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

export function PasswordChangeActions({ isLoading, onCancel }: PasswordChangeActionsProps) {
  return (
    <CardFooter className="flex flex-col space-y-4">
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Alterar Senha
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancelar
      </Button>
    </CardFooter>
  );
}
