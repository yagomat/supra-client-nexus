
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { ClienteExcelButtons } from "@/components/clientes/ClienteExcelButtons";
import { Cliente } from "@/types";

interface ClienteListHeaderProps {
  clientes: Cliente[];
  onImportSuccess: () => void;
}

export const ClienteListHeader = ({ clientes, onImportSuccess }: ClienteListHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-gray-500">Gerencie seus clientes</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <ClienteExcelButtons 
          clientes={clientes} 
          onImportSuccess={onImportSuccess} 
        />
        <Button onClick={() => navigate("/clientes/cadastrar")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
    </div>
  );
};
