
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CadastrarClienteHeaderProps {
  onBack: () => void;
}

export const CadastrarClienteHeader: React.FC<CadastrarClienteHeaderProps> = ({
  onBack,
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <h1 className="text-2xl font-bold">Cadastrar Cliente</h1>
    </div>
  );
};
