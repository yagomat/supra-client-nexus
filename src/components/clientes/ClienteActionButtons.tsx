
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Cliente } from "@/types";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClienteActionButtonsProps {
  cliente: Cliente;
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
}

export const ClienteActionButtons = ({ 
  cliente, 
  onVerDetalhes, 
  onConfirmarExclusao 
}: ClienteActionButtonsProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex gap-2 pt-2">
      <Button
        onClick={() => onVerDetalhes(cliente)}
        size="sm"
        variant="outline"
        className="flex-1 min-w-0"
      >
        <Eye className="w-4 h-4" />
        {!isMobile && <span className="ml-1">Detalhes</span>}
      </Button>

      <Button
        onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
        size="sm"
        variant="outline"
        className="flex-1 min-w-0"
      >
        <Pencil className="w-4 h-4" />
        {!isMobile && <span className="ml-1">Editar</span>}
      </Button>

      <Button
        onClick={() => onConfirmarExclusao(cliente.id)}
        size="sm"
        variant="destructive"
        className="flex-1 min-w-0"
      >
        <Trash2 className="w-4 h-4" />
        {!isMobile && <span className="ml-1">Excluir</span>}
      </Button>
    </div>
  );
};
