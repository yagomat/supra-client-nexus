
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ClienteListHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
      <h1 className="text-3xl font-bold tracking-tight">Lista de Clientes</h1>
      <Button
        onClick={() => navigate("/clientes/cadastrar")}
      >
        Cadastrar Cliente
      </Button>
    </div>
  );
};
