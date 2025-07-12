
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, MessageCircle, Pencil } from "lucide-react";
import { Cliente } from "@/types";

interface ClienteCardActionsProps {
  cliente: Cliente;
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
  onSendWhatsApp: (cliente: Cliente) => void;
}

export const ClienteCardActions = ({
  cliente,
  onVerDetalhes,
  onConfirmarExclusao,
  onSendWhatsApp
}: ClienteCardActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onVerDetalhes(cliente)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSendWhatsApp(cliente)}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onConfirmarExclusao(cliente.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
