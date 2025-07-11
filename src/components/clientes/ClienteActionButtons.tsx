
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { ClienteExcelButtons } from "@/components/clientes/ClienteExcelButtons";
import { Cliente } from "@/types";

interface ClienteActionButtonsProps {
  allClientes: Cliente[];
  onImportSuccess: () => void;
}

export const ClienteActionButtons = ({
  allClientes,
  onImportSuccess
}: ClienteActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <ClienteExcelButtons 
          clientes={allClientes} 
          onImportSuccess={onImportSuccess} 
        />
      </div>
      <div className="lg:w-64">
        <Button onClick={() => navigate("/clientes/cadastrar")} className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
    </div>
  );
};
