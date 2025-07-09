
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditClienteHeaderProps {
  clienteNome: string;
  onBack: () => void;
}

export const EditClienteHeader: React.FC<EditClienteHeaderProps> = ({
  clienteNome,
  onBack,
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <h1 className="text-2xl font-bold">Editar Cliente: {clienteNome}</h1>
    </div>
  );
};
